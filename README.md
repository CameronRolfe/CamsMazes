# CamsMazes
A node package that generates mazes


# How to Install
```
npm install camsmazes
```

# How to Use
```javascript
const Maze = require("camsmazes")

const maze = new Maze(rows, columns); 

//  Create maze that generates starting at a specific row and column (Default is 0 for both)
const maze2 = new Maze(rows, columns, startRow, startColumn) 

// Create maze that ends at a specific row and column (Default is rows-1 for endRow and col-1 for endColumn)
const maze3 = new Maze(rows, columns, startRow, startColumn, endRow, endColumn)
```

# Export to PNG or JPEG
```javascript
const Maze = require("camsmazes")
const maze = new Maze(40, 40);
maze.save(fileName, fileExt, cellSize, showSolution) // Default is maze.png with a cellSize = 10 and showSolution is false
```

# Generated Maze in form of Array   
 Number|  Description  |
| ---- | ------------- |
| 0    | Walkable Cell |
| 1    | Wall          |
| 2    | Start Cell    |
| 3    | End Cell      |
| 4    | Solution Path | 

```javascript
const Maze = require("camsmazes")
const maze = new Maze(40, 40);
const grid = maze.grid; // Grid representing maze
const gridSolution = maze.gridSolution; // Grid representing maze with solution
```