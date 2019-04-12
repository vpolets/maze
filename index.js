'use strict';
import './styles.css';

const maze = document.querySelector('#maze');
const mazeFrame = document.querySelector('#maze-frame');

function mazeSize(height, width) {
  this.height = height;
  this.width = width;
}

function point(i, j) {
  this.i = i;
  this.j = j;
}
const renderTable = array => {
  const table = document.createElement('table');
  const tbody = document.createElement('tbody');

  for (let i = 0; i < array.length; i++) {
    const tr = document.createElement('tr');
    for (let j = 0; j < array[i].length; j++) {
      const td = document.createElement('td');
      td.setAttribute('value', array[i][j]);
      if (array[i][j] !== -2) {
        array[i][j] = -1;
      }
      tr.append(td);
    }
    tbody.append(tr);
  }

  table.append(tbody);
  return table;
};

const setStartPoint = (cell, table) => {
  if (table.querySelector('.start-point')) {
    table.querySelector('.start-point').classList.remove('start-point');
  }
  table.rows[cell.i].cells[cell.j].classList.add('start-point');
};

const setFinishPoint = (cell, table) => {
  if (table.querySelector('.finish-point')) {
    table.querySelector('.finish-point').classList.remove('finish-point');
  }
  table.rows[cell.i].cells[cell.j].classList.add('finish-point');
};

const randomInteger = (min, max) => {
  return Math.round(min - 0.5 + Math.random() * (max - min + 1));
};

const makeArrayGrid = size => {
  const width = size.width % 2 === 0 ? +size.width + 1 : size.width;
  const height = size.height % 2 === 0 ? +size.height + 1 : size.height;
  const arrayGrid = [];
  for (let i = 0; i < height; i++) {
    arrayGrid[i] = [];
    for (let j = 0; j < width; j++) {
      if (
        i > 0 &&
        i < height - 1 &&
        j > 0 &&
        j < width - 1 &&
        i % 2 === 1 &&
        j % 2 === 1
      ) {
        arrayGrid[i][j] = -1;
      } else {
        arrayGrid[i][j] = -2;
      }
    }
  }
  return arrayGrid;
};
const isUnvisited = array => {
  return array.some(rows => rows.some(el => el === -1));
};
const getUnvisitedCells = array => {
  const unvisited = [];

  array.forEach((row, i) =>
    row.forEach((cell, j) => {
      if (cell === -1) {
        unvisited.push(new point(i, j));
      }
    })
  );

  return unvisited;
};

const unvisitedNeighbors = (cell, array, radius, value) => {
  const unvisited = [];

  if (array[cell.i - radius]) {
    if (array[cell.i - radius][cell.j]) {
      if (
        array[cell.i - radius][cell.j] === -1 ||
        array[cell.i - radius][cell.j] - value > 1
      ) {
        unvisited.push(new point(cell.i - radius, cell.j));
      }
    }
  }

  if (array[cell.i][cell.j + radius]) {
    if (
      array[cell.i][cell.j + radius] === -1 ||
      array[cell.i][cell.j + radius] - value > 1
    ) {
      unvisited.push(new point(cell.i, cell.j + radius));
    }
  }

  if (array[cell.i + radius]) {
    if (array[cell.i + radius][cell.j]) {
      if (
        array[cell.i + radius][cell.j] === -1 ||
        array[cell.i + radius][cell.j] - value > 1
      ) {
        unvisited.push(new point(cell.i + radius, cell.j));
      }
    }
  }

  if (array[cell.i][cell.j - radius]) {
    if (
      array[cell.i][cell.j - radius] === -1 ||
      array[cell.i][cell.j - radius] - value > 1
    ) {
      unvisited.push(new point(cell.i, cell.j - radius));
    }
  }

  return unvisited;
};

const removeWall = (curr, sel, array) => {
  let wall;
  if (curr.i === sel.i) {
    if (curr.j > sel.j) {
      wall = new point(curr.i, curr.j - 1);
    } else {
      wall = new point(curr.i, curr.j + 1);
    }
  } else if (curr.i > sel.i) {
    wall = new point(curr.i - 1, curr.j);
  } else {
    wall = new point(curr.i + 1, curr.j);
  }
  array[wall.i][wall.j] = 2;
};

const buildMazeArray = size => {
  const maze = [...makeArrayGrid(size)];
  const stack = [];

  const startPoint = new point(1, 1);
  let currentPoint = startPoint;

  while (isUnvisited(maze)) {
    const unvisited = unvisitedNeighbors(currentPoint, maze, 2);
    if (unvisited.length > 0) {
      stack.push(currentPoint);
      const selected = unvisited[randomInteger(0, unvisited.length - 1)];
      removeWall(currentPoint, selected, maze);
      currentPoint = selected;
      maze[currentPoint.i][currentPoint.j] = 2;
    } else if (stack.length > 0) {
      currentPoint = stack.pop();
    } else {
      const unvisitedCells = getUnvisitedCells(maze);
      currentPoint =
        unvisitedCells[randomInteger(0, unvisitedCells.length - 1)];
      maze[currentPoint.i][currentPoint.j] = 2;
    }
  }

  return maze;
};

const findExit = (mazeArray, start, finish) => {
  const array = mazeArray.map(function(arr) {
    return arr.slice();
  });
  const stack = [start];

  let entranceFound = false;
  let currentPoint = start;
  array[currentPoint.i][currentPoint.j] = 0;
  let step = array[currentPoint.i][currentPoint.j];
  do {
    step++;
    const unvisited = unvisitedNeighbors(currentPoint, array, 1, step);
    if (unvisited.length > 0) {
      const selected = unvisited[0];
      if (finish.i === selected.i && finish.j === selected.j) {
        entranceFound = true;
        array[selected.i][selected.j] = step;
        currentPoint = stack.pop();
        step = array[currentPoint.i][currentPoint.j];
      } else {
        stack.push(currentPoint);
        currentPoint = selected;
        array[currentPoint.i][currentPoint.j] = step;
      }
    } else if (stack.length > 0) {
      currentPoint = stack.pop();
      step = array[currentPoint.i][currentPoint.j];
    } else if (finish.i === start.i && finish.j === start.j) {
      alert('Remove start or finish poit to another cell.');
      entranceFound = !entranceFound;
    } else {
      alert("There isn't an exit!");
      entranceFound = !entranceFound;
    }
  } while (!entranceFound || stack.length);

  return array;
};

const renderWay = (array, table, callback) => {
  let params = [];
  const max = Math.max(...[].concat(...array));

  for (let i = 0; i <= max; i++) {
    params.push([]);
  }

  array.forEach((row, i) =>
    row.forEach((cell, j) => {
      if (cell !== -2 && cell !== -1) {
        params[cell].push(new point(i, j));
      }
    })
  );

  const func = (array, table, counter) => {
    array.forEach(
      cell => (table.rows[cell.i].cells[cell.j].textContent = counter)
    );
  };

  const stepsTimeout = (params, counter) => {
    if (!params.length) {
      callback();
      return;
    }
    const currentParams = params.shift();

    func(currentParams, table, counter++);
    setTimeout(() => {
      stepsTimeout(params, counter);
    }, 30);
  };

  let counter = 0;
  stepsTimeout(params, counter);
};

const findSmallestNeighbor = (cell, array) => {
  let smallest;

  if (array[cell.i - 1]) {
    if (array[cell.i - 1][cell.j]) {
      if (
        array[cell.i - 1][cell.j] > -1 &&
        array[cell.i - 1][cell.j] - array[cell.i][cell.j] === -1
      ) {
        smallest = new point(cell.i - 1, cell.j);
      }
    }
  }

  if (array[cell.i][cell.j + 1]) {
    if (
      array[cell.i][cell.j + 1] > -1 &&
      array[cell.i][cell.j + 1] - array[cell.i][cell.j] === -1
    ) {
      smallest = new point(cell.i, cell.j + 1);
    }
  }

  if (array[cell.i + 1]) {
    if (array[cell.i + 1][cell.j]) {
      if (
        array[cell.i + 1][cell.j] > -1 &&
        array[cell.i + 1][cell.j] - array[cell.i][cell.j] === -1
      ) {
        smallest = new point(cell.i + 1, cell.j);
      }
    }
  }

  if (array[cell.i][cell.j - 1]) {
    if (
      array[cell.i][cell.j - 1] > -1 &&
      array[cell.i][cell.j - 1] - array[cell.i][cell.j] === -1
    ) {
      smallest = new point(cell.i, cell.j - 1);
    }
  }

  return smallest;
};

const showShortestWay = (array, table, finish, start) => {
  const shortWay = [];
  let current = finish;

  while (array[current.i][current.j] !== 1) {
    current = findSmallestNeighbor(current, array);
    shortWay.push(current);
  }

  const func = cell => {
    table.rows[cell.i].cells[cell.j].classList.add('short');
  };

  const stepsTimeout = (params, counter) => {
    if (!params.length) return;
    const currentParams = params.pop();

    func(currentParams);
    setTimeout(() => {
      stepsTimeout(params);
    }, 30);
  };

  stepsTimeout(shortWay);
};

const renderControllButtons = frame => {
  const block = document.createElement('div');
  block.classList.add('controll-buttons');

  const setStartButton = document.createElement('button');
  const setFinishtButton = document.createElement('button');
  const setWallButton = document.createElement('button');
  const findPathButton = document.createElement('button');

  setStartButton.id = 'set-start';
  setFinishtButton.id = 'set-finish';
  setWallButton.id = 'set-wall';
  findPathButton.id = 'find-path';

  setStartButton.textContent = 'Set start';
  setFinishtButton.textContent = 'Set finish';
  setWallButton.textContent = 'Set wall';
  findPathButton.textContent = 'Find shortest path';

  block.append(setStartButton, setFinishtButton, setWallButton, findPathButton);
  frame.append(block);
};

//Maze Controlls

document.getElementById('generate-maze').addEventListener('click', event => {
  const height = document.getElementById('maze-height').value;
  const width = document.getElementById('maze-width').value;
  const size = new mazeSize(height, width);
  const mazeArray = buildMazeArray(size);

  let startPoint = new point(1, 1);
  let finishPoint = new point(
    mazeArray.length - 2,
    mazeArray[mazeArray.length - 2].length - 2
  );

  if (maze.querySelector('table')) {
    maze.querySelector('table').remove();
    mazeFrame.querySelector('.controll-buttons').remove();
  }

  maze.append(renderTable(mazeArray));
  renderControllButtons(document.getElementById('maze-frame'));
  let grid = maze.querySelector('tbody');
  setStartPoint(startPoint, grid);
  setFinishPoint(finishPoint, grid);
  let currentAction = 3;

  mazeFrame
    .querySelector('.controll-buttons')
    .addEventListener('click', event => {
      /*Legend to currentAction
       ** 1 - Set Start
       ** 2 - Set Finish
       ** 3 - Set Wall
       */

      const target = event.target;
      if (target.id === 'set-start') {
        currentAction = 1;
      }

      if (target.id === 'set-finish') {
        currentAction = 2;
      }

      if (target.id === 'set-wall') {
        currentAction = 3;
      }

      if (target.id === 'find-path') {
        maze.querySelector('table').remove();
        maze.prepend(renderTable(mazeArray));
        grid = maze.querySelector('tbody');
        setStartPoint(startPoint, grid);
        setFinishPoint(finishPoint, grid);
        let ways = findExit(mazeArray, startPoint, finishPoint);
        renderWay(ways, grid, () => {
          showShortestWay(ways, grid, finishPoint, startPoint);
        });
      }
      return;
    });

  document.addEventListener('click', event => {
    if (event.target.tagName !== 'TD') {
      return;
    }
    const target = event.target;
    const coordX = target.cellIndex;
    const coordY = target.parentNode.sectionRowIndex;

    if (currentAction === 1) {
      startPoint = new point(coordY, coordX);
      setStartPoint(startPoint, maze.querySelector('tbody'));
    }

    if (currentAction === 2) {
      finishPoint = new point(coordY, coordX);
      setFinishPoint(finishPoint, maze.querySelector('tbody'));
    }

    if (currentAction === 3) {
      if (
        +maze
          .querySelector('tbody')
          .rows[coordY].cells[coordX].getAttribute('value') === -2
      ) {
        maze
          .querySelector('tbody')
          .rows[coordY].cells[coordX].setAttribute('value', '0');
        mazeArray[coordY][coordX] = -1;
      } else {
        maze
          .querySelector('tbody')
          .rows[coordY].cells[coordX].setAttribute('value', '-2');
        mazeArray[coordY][coordX] = -2;
      }
    }
  });
});
