const { createCanvas} = require('canvas')

class Cell {
    constructor(row, col) {
        this.row = row
        this.col = col
        this.gridRow = (row * 2) + 1
        this.gridCol = (col  * 2) + 1
        this.gridCell = [this.gridRow, this.gridCol]
        this.visited = false
        this.walls = {"top": 1, "right": 1, "bottom": 1, "left": 1}
      }
      
      getNeighbours(grid=false) {
        const row = (grid) ? this.gridRow : this.row
        const col = (grid) ? this.gridCol : this.col
        const neighbourMap = {
            "top": [row-1, col],
            "right": [row, col+1],
            "bottom": [row+1, col],
            "left": [row, col-1]
        }

        return neighbourMap
      }

      updateWalls(wallPos) {
        this.walls[wallPos] = 0
      }

      getWall(wallPos) {
        const neighbourMap = this.getNeighbours(true);
        return neighbourMap[wallPos]
      }
  
}

class Maze {
    constructor(numRows, numCols, startRow = 0, startCol = 0, endRow = null, endCol = null) {
      this.numRows = numRows;
      this.numCols = numCols;
      this.startRow = startRow
      this.startCol = startCol
      this.endRow = (endRow) ? endRow : numRows - 1
      this.endCol = (endCol) ? endCol : numCols - 1

      this.generateMaze()
    }

    initalizeMaze () {
        let ungeneratedMaze = []
        const numRows = this.numRows
        const numCols = this.numCols
        for (let row = 0; row < numRows; row++) {
            let rowArr = []
            for (let col = 0; col < numCols; col++) {
                const cell = new Cell(row, col)
                rowArr.push(cell)
            }
            ungeneratedMaze.push(rowArr)
        }
        this.maze = ungeneratedMaze
    }

    generateMaze() {
        let stack = []
        this.initalizeMaze()
        if (this.seed) random.seed(this.seed)
        let maze = this.maze;

        let startCell = maze[this.startRow][this.startCol]
        startCell.visited = true
        stack.push(startCell)  
        let generationPath = []
        generationPath.push(startCell.gridCell)
        
        // Returns true if neighbour is in Maze and not visited
        const check_neighbour = (row, col) => ((row >= 0 && col >= 0) && (row < this.numRows && col < this.numCols) && !maze[row][col].visited)

        const getRandomNeighbourPos = (neighboursLength) => Math.floor(Math.random() * neighboursLength);
        
        // Generate Maze using DFS
        while (stack.length > 0 ) {
            let cell = stack.pop()
            let neighbours = []
            // Filtering out any "bad" neighbours
            const neighboursMap = cell.getNeighbours()
            for (const [neighbourPos, neighbourCell] of Object.entries(neighboursMap)) {
                const [row, col] = neighbourCell
                if (check_neighbour(row, col)) neighbours.push([maze[row][col], neighbourPos])
            }
                
            if (neighbours.length > 0) {
                stack.push(cell)

                // Choosing random neighbour to visit
                const randomPos = getRandomNeighbourPos(neighbours.length)
                const neighbourArr = neighbours[randomPos]
                let [neighbour, neighbourPos] = neighbourArr
                neighbour.visited = true
                stack.push(neighbour)

                // Adding neighbour and wall to generation path
                const wall = cell.getWall(neighbourPos)
                generationPath.push(wall) // Wall between cell and neighbour
                generationPath.push(neighbour.gridCell) // Neighbour
                
                // Updating walls for current cell and neighbour
                cell.updateWalls(neighbourPos)
                const cellWallMap = {"top": "bottom", "right": "left", "bottom": "top", "left": "right"}
                const cellWallPos = cellWallMap[neighbourPos]
                neighbour.updateWalls(cellWallPos)
            }                             
              
        }
            
        this.generated = true
        this.generationPath = generationPath
        this.toGrid()
        this.solve()
        return maze
    }

    toGrid() {
        let grid = []
        const rows = this.numRows
        const cols = this.numCols
        const startRow = this.startRow;
        const startCol = this.startCol;
        const endRow = this.endRow;
        const endCol = this.endCol;
        const maze = this.maze;
        for (let row = 0; row < rows; row++) {
            let topArr = []
            let middleArr = []
            let bottomArr = []
            const lastRow = (row === rows - 1)
            for (let col = 0; col < cols; col++) {
                const lastCol = col == cols - 1
                const walls = maze[row][col].walls
                const [top, right, bottom, left] = Object.values(walls)
                topArr = topArr.concat([1, top, top || right])
                let cellType = 0
                if (row == startRow && col == startCol) cellType = 2
                if (row == endRow && col == endCol) cellType = 3
                middleArr = middleArr.concat([left, cellType, right])
                if (lastRow) bottomArr = bottomArr.concat([bottom || left, bottom, bottom || right])
                if (!lastCol) {
                    topArr.pop()
                    middleArr.pop()
                    if (lastRow) bottomArr.pop()
                }
            }
            grid.push(topArr)
            grid.push(middleArr)
            if (lastRow) grid.push(bottomArr)
        }
    
        this.grid = grid
        this.gridRows = (this.numRows * 2) + 1
        this.gridCols = (this.numCols * 2) + 1
        const convertToGridCell = (row, col) => [(row * 2) + 1, (col * 2) + 1]
        this.startGridCell = convertToGridCell(startRow, startCol)
        this.endGridCell = convertToGridCell(endRow, endCol)
        return grid
    }
    
    solve() {
        const grid = this.toGrid()
        const startCell = this.startGridCell
        const endCell = this.endGridCell
        const [startRow, startCol] = startCell;
        const [endRow, endCol] = endCell;
        let stack = []
        let visited = []

        const cellToString = (cell) => {
            const [row, col] = cell;
            return `${row}-${col}`
        }
        
        visited.push(cellToString(startCell))
        stack.push(cellToString(startCell))
        
        const getNeighbours = (cell) => {
            const [row, col] = cell
            let neighbours = []
            const numRows = this.gridRows
            const numCols = this.gridCols
            if (row > 0 && grid[row-1][col] != 1) neighbours.push([row-1,col]) // Top Neighbour
            if (col < numCols -1 && grid[row][col+1] != 1) neighbours.push([row,col+1]) // Right Neighbour
            if (row < numRows -1 && grid[row+1][col] != 1) neighbours.push([row+1,col]) // Bottom Neighbour
            if (col > 0 && grid[row][col-1] != 1) neighbours.push([row,col-1]) // Left Neighbour
            return neighbours
        }

        const stringToCell = (cellStr) => {
            const cellArr = cellStr.split("-");
            const [row, col] = cellArr
            return [parseInt(row), parseInt(col)]
        }
        
        let previousCellMap = {}
        previousCellMap[startCell] = null
        while (stack.length > 0) {
            const cellStr = stack.pop()
            visited.push(cellStr)
            const cell = stringToCell(cellStr)
            const neighbours = getNeighbours(cell)
            for (const neighbour of neighbours) {
                if (!visited.includes(cellToString(neighbour)) && !stack.includes(cellToString(neighbour))) {
                    previousCellMap[neighbour] = cell
                    const [row, col] = neighbour
                    if (row == endRow && col == endCol) break
                    stack.push(cellToString(neighbour))
                }
              
            }
        }
           
               
        // Creating solution path
        let solutionPath = [endCell]
        let neighbour = previousCellMap[endCell]
        solutionPath.push(neighbour)
        while (true) {
            const cell = previousCellMap[neighbour]
            if (!cell) break
            solutionPath.push(cell)
            neighbour = cell
        }
          
       
        solutionPath.reverse() // Reversing path so start_cell is at front
        for (const cell of solutionPath) {
            const [row, col] = cell
            if (!(row == startRow && col == startCol) && !(row == endRow && col == endCol)) grid[row][col] = 4
        }
            

        this.solution = solutionPath // Add Solution to Maze
        this.solved = true
        this.gridSolution = grid
        return grid
    }

    getRowText(row) {
        const text_map = {
            0: " ", // Walkable
            1: "#", // Wall
            2: "S", // Start
            3: "E", // End
            4: "X"  // Solution path
        }
        let rowStr = ""
        for (const cell of row) rowStr +=text_map[cell]
        return rowStr
    }

    getMazeText(show_solution = false) {
        let mazeStr = ""
        let currRow = 0
        const grid = (show_solution) ? this.gridSolution : this.grid
        for (const row of grid) {
            const rowStr = this.getRowText(row)
            mazeStr+=rowStr
            if (currRow != this.gridRows-1) mazeStr+="\n"
            currRow+=1
        }
        return mazeStr
    }


    print() {
        const mazeText = this.getMazeText()
        console.log(mazeText)
    }

    // Image Functions
    getCanvasCoords (cell, cellSize) {
        const [row, col] = cell;
        const x = col * cellSize;
        const y = row * cellSize;
        return [x, y]
    }

    drawCell(ctx, cell, cellType, cellSize) {
        const [x, y] = this.getCanvasCoords(cell, cellSize)
        const cellTypeColourMap = {0: "white", 1: "black", 2: "green", 3: "yellow", 4: "red"}
        ctx.fillStyle = cellTypeColourMap[cellType];
        ctx.fillRect(x, y, cellSize, cellSize);
    }

    getMazeCanvas(cellSize, showSolution=false) {
        const imageWidth = this.gridCols * cellSize;
        const imageHeight = this.gridRows * cellSize

        const canvas = createCanvas(imageWidth, imageHeight)
        const ctx = canvas.getContext('2d')
        const grid = (showSolution) ? this.gridSolution : this.toGrid()
        console.log(showSolution)
        for (let row = 0; row < this.gridRows; row++) {
            for (let col = 0; col < this.gridCols; col++) {
                const cell = [row, col]
                const cellType = grid[row][col]
                this.drawCell(ctx, cell, cellType, cellSize)
            }
        }
        return canvas;
    }

    getImageBase64(cellSize, showSolution=false) {
        const canvas = this.getMazeCanvas(cellSize, showSolution)
        return canvas.toDataURL();
    }
    
    save(fileName="maze", fileExt="png", cellSize=10, showSolution=false) {
        if (!["png", "jpg", "jpeg"].includes(fileExt)) {
            console.log("Unsupported file type");
            return;
        }
        const canvas = this.getMazeCanvas(cellSize, showSolution)
        const out = eval('require')('fs').createWriteStream(`${fileName}.${fileExt}`)
        let stream = null;
        if (fileExt === "png") stream = canvas.createPNGStream()
        else if(fileExt == "jpg" || fileExt === "jpeg") stream = canvas.createJPEGStream()
        stream.pipe(out)
        out.on('finish', () =>  console.log(`${fileName}.${fileExt} was created.`))
    }
}

module.exports = Maze;