class PgnMove {
    constructor(fromCol, fromRow, toCol, toRow, piece) {
        this.fromCol = fromCol;
        this.fromRow = fromRow;
        this.toCol = toCol;
        this.toRow = toRow;
        this.piece = piece;
    }
}

class Square {
    constructor(r, c) {
        this.row = r;
        this.col = c;
    }
}

class EnpassantChecks {
    constructor(checkSquares, enPassantLocation) {
        this.checkSquares = checkSquares;
        this.enPassantLocation = enPassantLocation;
    }
}

class PgnConverter {
    static SkipChars = new Set(['!', '?', '+', '#', '*']);
    static CanEnPassantMovesWhite = {
        "a2a4": { EnPassantLocation: "a3", CheckSquares: [{ row: 4, col: 1 }] },
        "b2b4": { EnPassantLocation: "b3", CheckSquares: [{ row: 4, col: 0 }, { row: 4, col: 2 }] },
        "c2c4": { EnPassantLocation: "c3", CheckSquares: [{ row: 4, col: 1 }, { row: 4, col: 3 }] },
        "d2d4": { EnPassantLocation: "d3", CheckSquares: [{ row: 4, col: 2 }, { row: 4, col: 4 }] },
        "e2e4": { EnPassantLocation: "e3", CheckSquares: [{ row: 4, col: 3 }, { row: 4, col: 5 }] },
        "f2f4": { EnPassantLocation: "f3", CheckSquares: [{ row: 4, col: 4 }, { row: 4, col: 6 }] },
        "g2g4": { EnPassantLocation: "g3", CheckSquares: [{ row: 4, col: 5 }, { row: 4, col: 7 }] },
        "h2h4": { EnPassantLocation: "h3", CheckSquares: [{ row: 4, col: 6 }] }
    };
    static CanEnPassantMovesBlack = {
        "a7a5": { EnPassantLocation: "a6", CheckSquares: [{ row: 3, col: 1 }] },
        "b7b5": { EnPassantLocation: "b6", CheckSquares: [{ row: 3, col: 0 }, { row: 3, col: 2 }] },
        "c7c5": { EnPassantLocation: "c6", CheckSquares: [{ row: 3, col: 1 }, { row: 3, col: 3 }] },
        "d7d5": { EnPassantLocation: "d6", CheckSquares: [{ row: 3, col: 2 }, { row: 3, col: 4 }] },
        "e7e5": { EnPassantLocation: "e6", CheckSquares: [{ row: 3, col: 3 }, { row: 3, col: 5 }] },
        "f7f5": { EnPassantLocation: "f6", CheckSquares: [{ row: 3, col: 4 }, { row: 3, col: 6 }] },
        "g7g5": { EnPassantLocation: "g6", CheckSquares: [{ row: 3, col: 5 }, { row: 3, col: 7 }] },
        "h7h5": { EnPassantLocation: "h6", CheckSquares: [{ row: 3, col: 6 }] }
    };
    static Cols = { 0: 'a', 1: 'b', 2: 'c', 3: 'd', 4: 'e', 5: 'f', 6: 'g', 7: 'h' };
    static Rows = { 7: '1', 6: '2', 5: '3', 4: '4', 3: '5', 2: '6', 1: '7', 0: '8' };
    static ColsChar = { 'a': 0, 'b': 1, 'c': 2, 'd': 3, 'e': 4, 'f': 5, 'g': 6, 'h': 7 };
    static RowsChar = { '1': 7, '2': 6, '3': 5, '4': 4, '5': 3, '6': 2, '7': 1, '8': 0 };
    static fastDiagonalLookups = new Map([
        [0, new Set([9, 18, 27, 36, 45, 54, 63])],
        [1, new Set([8, 10, 19, 28, 37, 46, 55])],
        [2, new Set([9, 16, 11, 20, 29, 38, 47])],
        [3, new Set([10, 17, 24, 12, 21, 30, 39])],
        [4, new Set([11, 18, 25, 32, 13, 22, 31])],
        [5, new Set([12, 19, 26, 33, 40, 14, 23])],
        [6, new Set([13, 20, 27, 34, 41, 48, 15])],
        [7, new Set([14, 21, 28, 35, 42, 49, 56])],
        [8, new Set([1, 17, 26, 35, 44, 53, 62])],
        [9, new Set([0, 16, 2, 18, 27, 36, 45, 54, 63])],
        [10, new Set([1, 17, 24, 3, 19, 28, 37, 46, 55])],
        [11, new Set([2, 18, 25, 32, 4, 20, 29, 38, 47])],
        [12, new Set([3, 19, 26, 33, 40, 5, 21, 30, 39])],
        [13, new Set([4, 20, 27, 34, 41, 48, 6, 22, 31])],
        [14, new Set([5, 21, 28, 35, 42, 49, 56, 7, 23])],
        [15, new Set([6, 22, 29, 36, 43, 50, 57])],
        [16, new Set([9, 2, 25, 34, 43, 52, 61])],
        [17, new Set([8, 24, 10, 3, 26, 35, 44, 53, 62])],
        [18, new Set([9, 0, 25, 32, 11, 4, 27, 36, 45, 54, 63])],
        [19, new Set([10, 1, 26, 33, 40, 12, 5, 28, 37, 46, 55])],
        [20, new Set([11, 2, 27, 34, 41, 48, 13, 6, 29, 38, 47])],
        [21, new Set([12, 3, 28, 35, 42, 49, 56, 14, 7, 30, 39])],
        [22, new Set([13, 4, 29, 36, 43, 50, 57, 15, 31])],
        [23, new Set([14, 5, 30, 37, 44, 51, 58])],
        [24, new Set([17, 10, 3, 33, 42, 51, 60])],
        [25, new Set([16, 32, 18, 11, 4, 34, 43, 52, 61])],
        [26, new Set([17, 8, 33, 40, 19, 12, 5, 35, 44, 53, 62])],
        [27, new Set([18, 9, 0, 34, 41, 48, 20, 13, 6, 36, 45, 54, 63])],
        [28, new Set([19, 10, 1, 35, 42, 49, 56, 21, 14, 7, 37, 46, 55])],
        [29, new Set([20, 11, 2, 36, 43, 50, 57, 22, 15, 38, 47])],
        [30, new Set([21, 12, 3, 37, 44, 51, 58, 23, 39])],
        [31, new Set([22, 13, 4, 38, 45, 52, 59])],
        [32, new Set([25, 18, 11, 4, 41, 50, 59])],
        [33, new Set([24, 40, 26, 19, 12, 5, 42, 51, 60])],
        [34, new Set([25, 16, 41, 48, 27, 20, 13, 6, 43, 52, 61])],
        [35, new Set([26, 17, 8, 42, 49, 56, 28, 21, 14, 7, 44, 53, 62])],
        [36, new Set([27, 18, 9, 0, 43, 50, 57, 29, 22, 15, 45, 54, 63])],
        [37, new Set([28, 19, 10, 1, 44, 51, 58, 30, 23, 46, 55])],
        [38, new Set([29, 20, 11, 2, 45, 52, 59, 31, 47])],
        [39, new Set([30, 21, 12, 3, 46, 53, 60])],
        [40, new Set([33, 26, 19, 12, 5, 49, 58])],
        [41, new Set([32, 48, 34, 27, 20, 13, 6, 50, 59])],
        [42, new Set([33, 24, 49, 56, 35, 28, 21, 14, 7, 51, 60])],
        [43, new Set([34, 25, 16, 50, 57, 36, 29, 22, 15, 52, 61])],
        [44, new Set([35, 26, 17, 8, 51, 58, 37, 30, 23, 53, 62])],
        [45, new Set([36, 27, 18, 9, 0, 52, 59, 38, 31, 54, 63])],
        [46, new Set([37, 28, 19, 10, 1, 53, 60, 39, 55])],
        [47, new Set([38, 29, 20, 11, 2, 54, 61])],
        [48, new Set([41, 34, 27, 20, 13, 6, 57])],
        [49, new Set([40, 56, 42, 35, 28, 21, 14, 7, 58])],
        [50, new Set([41, 32, 57, 43, 36, 29, 22, 15, 59])],
        [51, new Set([42, 33, 24, 58, 44, 37, 30, 23, 60])],
        [52, new Set([43, 34, 25, 16, 59, 45, 38, 31, 61])],
        [53, new Set([44, 35, 26, 17, 8, 60, 46, 39, 62])],
        [54, new Set([45, 36, 27, 18, 9, 0, 61, 47, 63])],
        [55, new Set([46, 37, 28, 19, 10, 1, 62])],
        [56, new Set([49, 42, 35, 28, 21, 14, 7])],
        [57, new Set([48, 50, 43, 36, 29, 22, 15])],
        [58, new Set([49, 40, 51, 44, 37, 30, 23])],
        [59, new Set([50, 41, 32, 52, 45, 38, 31])],
        [60, new Set([51, 42, 33, 24, 53, 46, 39])],
        [61, new Set([52, 43, 34, 25, 16, 54, 47])],
        [62, new Set([53, 44, 35, 26, 17, 8, 55])],
        [63, new Set([54, 45, 36, 27, 18, 9, 0])]
    ]);

    constructor() {
        this.chessBoard = [
            ["r", "n", "b", "q", "k", "b", "n", "r"],
            ["p", "p", "p", "p", "p", "p", "p", "p"],
            ["", "", "", "", "", "", "", ""],
            ["", "", "", "", "", "", "", ""],
            ["", "", "", "", "", "", "", ""],
            ["", "", "", "", "", "", "", ""],
            ["P", "P", "P", "P", "P", "P", "P", "P"],
            ["R", "N", "B", "Q", "K", "B", "N", "R"]
        ];
        this.internalWhiteLostCastleRightsKingside = false;
        this.internalWhiteLostCastleRightsQueenside = false;
        this.internalBlackLostCastleRightsKingside = false;
        this.internalBlackLostCastleRightsQueenside = false;
        this.enPassantLocation = "-";
        this.internalIsBlacksMove = false;
        this.internalMoveCount = 0;
        this.internalHalfMovesSinceCaptureOrPawnCount = 0;
        this.internalPgnSb = [];
    }

    getMoveInCurrentPosition() {
        return Math.floor(this.internalMoveCount / 2) + 1;
    }

    getPGNFromSmithNotation(smithNotation) {
        try {
            let moves = smithNotation.split(' ');
            moves.forEach(m => {
                this.makeNextSmithMove(m);
            });
        } catch (e) { }
        return this.internalPgnSb.join("");
    }

    getFENPosition() {
        let fenSB = [];
        for (let r = 0; r < 8; r++) {
            let emptyCounter = 0;
            for (let c = 0; c < 8; c++) {
                let piece = this.chessBoard[r][c];
                if (piece === "") {
                    emptyCounter++;
                } else {
                    if (emptyCounter > 0) {
                        fenSB.push(emptyCounter);
                        emptyCounter = 0;
                    }
                    fenSB.push(piece);
                }
            }
            if (emptyCounter > 0) {
                fenSB.push(emptyCounter);
            }
            if (r !== 7) {
                fenSB.push("/");
            }
        }
        fenSB.push(this.internalIsBlacksMove ? " b " : " w ");

        let hasCastleRights = false;
        if (!this.internalWhiteLostCastleRightsKingside) {
            hasCastleRights = true;
            fenSB.push("K");
        }
        if (!this.internalWhiteLostCastleRightsQueenside) {
            hasCastleRights = true;
            fenSB.push("Q");
        }
        if (!this.internalBlackLostCastleRightsKingside) {
            hasCastleRights = true;
            fenSB.push("k");
        }
        if (!this.internalBlackLostCastleRightsQueenside) {
            hasCastleRights = true;
            fenSB.push("q");
        }
        if (!hasCastleRights) {
            fenSB.push("-");
        }
        fenSB.push(` ${this.enPassantLocation} ${this.internalHalfMovesSinceCaptureOrPawnCount} ${this.getMoveInCurrentPosition()}`);
        return fenSB.join("");
    }

    makeNextSmithMove(m) {
        try {
            if (!this.internalPgnSb) this.internalPgnSb = [];
            let makeMoves = [];
            let from = m.substring(0, 2);
            let to = m.substring(2, 4);
            let fromCol = m.charCodeAt(0) - 'a'.charCodeAt(0);
            let fromRow = 7 - (m.charCodeAt(1) - '1'.charCodeAt(0));
            let toCol = m.charCodeAt(2) - 'a'.charCodeAt(0);
            let toRow = 7 - (m.charCodeAt(3) - '1'.charCodeAt(0));
            let movePiece = this.chessBoard[fromRow][fromCol];
            let toPiece = this.chessBoard[toRow][toCol];

            if (movePiece === "p" || movePiece === "P" || toPiece !== "") {
                this.internalHalfMovesSinceCaptureOrPawnCount = 0;
            } else {
                this.internalHalfMovesSinceCaptureOrPawnCount++;
            }

            if (from === "a8") this.internalBlackLostCastleRightsQueenside = true;
            if (from === "a1") this.internalWhiteLostCastleRightsQueenside = true;
            if (from === "h8") this.internalBlackLostCastleRightsKingside = true;
            if (from === "h1") this.internalWhiteLostCastleRightsKingside = true;

            this.enPassantLocation = "-";
            if (movePiece === "P" && PgnConverter.CanEnPassantMovesWhite[m]) {
                for (let c of PgnConverter.CanEnPassantMovesWhite[m].CheckSquares) {
                    if (this.chessBoard[c.row][c.col] === "p") {
                        this.enPassantLocation = PgnConverter.CanEnPassantMovesWhite[m].EnPassantLocation;
                        break;
                    }
                }
            }
            if (movePiece === "p" && PgnConverter.CanEnPassantMovesBlack[m]) {
                for (let c of PgnConverter.CanEnPassantMovesBlack[m].CheckSquares) {
                    if (this.chessBoard[c.row][c.col] === "P") {
                        this.enPassantLocation = PgnConverter.CanEnPassantMovesBlack[m].EnPassantLocation;
                        break;
                    }
                }
            }

            let nextMove = "";
            if (movePiece === "k") {
                this.internalBlackLostCastleRightsKingside = true;
                this.internalBlackLostCastleRightsQueenside = true;
                if (fromCol === 4 && fromRow === 0) {
                    if (toCol === 6 && toRow === 0) {
                        nextMove = "0-0";
                        makeMoves.push({ fromRow: 0, fromCol: 7, toRow: 0, toCol: 5, piece: "r" });
                    }
                    if (toCol === 2 && toRow === 0) {
                        nextMove = "0-0-0";
                        makeMoves.push({ fromRow: 0, fromCol: 0, toRow: 0, toCol: 3, piece: "r" });
                    }
                }
            }
            if (movePiece === "K") {
                this.internalWhiteLostCastleRightsKingside = true;
                this.internalWhiteLostCastleRightsQueenside = true;
                if (fromCol === 4 && fromRow === 7) {
                    if (toCol === 6 && toRow === 7) {
                        nextMove = "0-0";
                        makeMoves.push({ fromRow: 7, fromCol: 7, toRow: 7, toCol: 5, piece: "R" });
                    }
                    if (toCol === 2 && toRow === 7) {
                        nextMove = "0-0-0";
                        makeMoves.push({ fromRow: 7, fromCol: 0, toRow: 7, toCol: 3, piece: "R" });
                    }
                }
            }
            if (nextMove === "") {
                let isCapture = toPiece !== "";
                if (movePiece === "P" || movePiece === "p") {
                    if (isCapture) nextMove = `${PgnConverter.Cols[fromCol]}x${to}`;
                    else nextMove = to;
                } else {
                    switch (movePiece) {
                        case "R":
                        case "r":
                            nextMove = `R${from}${isCapture ? "x" : ""}${to}`;
                            break;
                        case "Q":
                        case "q":
                            nextMove = `Q${from}${isCapture ? "x" : ""}${to}`;
                            break;
                        case "B":
                        case "b":
                            nextMove = `B${from}${isCapture ? "x" : ""}${to}`;
                            break;
                        case "N":
                        case "n":
                            nextMove = `N${from}${isCapture ? "x" : ""}${to}`;
                            break;
                        case "K":
                        case "k":
                            nextMove = `K${isCapture ? "x" : ""}${to}`;
                            break;
                    }
                }
                if (m.length > 4 && (movePiece === "P" || movePiece === "p")) {
                    let upgradePiece = m[4];
                    switch (upgradePiece) {
                        case "q":
                        case "Q":
                            nextMove += "=Q";
                            movePiece = movePiece === "P" ? "Q" : "q";
                            break;
                        case "n":
                        case "N":
                            nextMove += "=N";
                            movePiece = movePiece === "P" ? "N" : "n";
                            break;
                        case "b":
                        case "B":
                            nextMove += "=B";
                            movePiece = movePiece === "P" ? "B" : "b";
                            break;
                        case "r":
                        case "R":
                            nextMove += "=R";
                            movePiece = movePiece === "P" ? "R" : "r";
                            break;
                    }
                }
            }
            this.chessBoard[fromRow][fromCol] = "";
            this.chessBoard[toRow][toCol] = movePiece;
            makeMoves.forEach(makeMove => {
                this.chessBoard[makeMove.fromRow][makeMove.fromCol] = "";
                this.chessBoard[makeMove.toRow][makeMove.toCol] = makeMove.piece;
            });

            if (this.internalMoveCount % 2 === 0) {
                if (this.internalMoveCount > 0) {
                    this.internalPgnSb.push(" ");
                }
                this.internalPgnSb.push(`${Math.floor(this.internalMoveCount / 2) + 1}. `);
            } else {
                this.internalPgnSb.push(" ");
            }
            this.internalPgnSb.push(nextMove);
            this.internalMoveCount++;
            this.internalIsBlacksMove = !this.internalIsBlacksMove;
        } catch (e) { }
    }

    internalMakeNextPgnMove(piece, fromRow, fromCol, toRow, toCol, upgrade, smithNotationMoves) {
        let smithMove = `${PgnConverter.Cols[fromCol]}${PgnConverter.Rows[fromRow]}${PgnConverter.Cols[toCol]}${PgnConverter.Rows[toRow]}${upgrade}`;
        let pieceAtToLocation = this.chessBoard[toRow][toCol];
        this.chessBoard[fromRow][fromCol] = "";
        this.chessBoard[toRow][toCol] = piece;

        let toID = this.chessBoardIDs[toRow][toCol];
        if (toID !== "") {
            this.pieceLocations.delete(toID);
            var setObj = this.uniquePieceIDs.get(pieceAtToLocation);
            setObj.delete(toID);
        }

        let fromID = this.chessBoardIDs[fromRow][fromCol];
        if (fromID !== "") {
            this.pieceLocations.get(fromID).row = toRow;
            this.pieceLocations.get(fromID).col = toCol;
        }

        this.chessBoardIDs[toRow][toCol] = this.chessBoardIDs[fromRow][fromCol];
        this.chessBoardIDs[fromRow][fromCol] = "";

        if (upgrade !== "") {
            let newID = this.nextID.toString();
            this.pieceLocations.set(newID, new Square(toRow, toCol));
            this.uniquePieceIDs[upgrade[0].toString()].add(newID);
            this.nextID++;
        }

        smithNotationMoves.push(smithMove);
    }

    internalCanPieceMoveToLocation(piece, fromRow, fromCol, toRow, toCol) {
        if (piece === 'b' || piece === 'B') {
            let key1 = fromRow * 8 + fromCol;
            let key2 = toRow * 8 + toCol;
            let isOnDiagonal = PgnConverter.fastDiagonalLookups.has(key1) && PgnConverter.fastDiagonalLookups.get(key1).has(key2);
            if (!isOnDiagonal) return false;

            while (toRow !== fromRow || toCol !== fromCol) {
                if (fromRow < toRow) fromRow++;
                else if (fromRow > toRow) fromRow--;
                if (fromCol < toCol) fromCol++;
                else if (fromCol > toCol) fromCol--;
                if (toRow !== fromRow || toCol !== fromCol) {
                    if (this.chessBoard[fromRow][fromCol] !== "") return false;
                } else {
                    return true;
                }
            }
        }
        if (piece === 'r' || piece === 'R') {
            let isOnRowOrCol = (toRow === fromRow || toCol === fromCol);
            if (!isOnRowOrCol) return false;

            while (toRow !== fromRow || toCol !== fromCol) {
                if (fromRow < toRow) fromRow++;
                else if (fromRow > toRow) fromRow--;
                if (fromCol < toCol) fromCol++;
                else if (fromCol > toCol) fromCol--;
                if (toRow !== fromRow || toCol !== fromCol) {
                    if (this.chessBoard[fromRow][fromCol] !== "") return false;
                } else {
                    return true;
                }
            }
        }
        if (piece === 'q' || piece === 'Q') {
            let key1 = fromRow * 8 + fromCol;
            let key2 = toRow * 8 + toCol;
            let isOnDiagonal = PgnConverter.fastDiagonalLookups.has(key1) && PgnConverter.fastDiagonalLookups.get(key1).has(key2);
            let isOnRowOrCol = (toRow === fromRow || toCol === fromCol);
            if (!isOnRowOrCol && !isOnDiagonal) return false;

            while (toRow !== fromRow || toCol !== fromCol) {
                if (fromRow < toRow) fromRow++;
                else if (fromRow > toRow) fromRow--;
                if (fromCol < toCol) fromCol++;
                else if (fromCol > toCol) fromCol--;
                if (toRow !== fromRow || toCol !== fromCol) {
                    if (this.chessBoard[fromRow][fromCol] !== "") return false;
                } else {
                    return true;
                }
            }
        }
        if (piece === 'n' || piece === 'N') {
            return ((fromRow + 2 === toRow) && (fromCol + 1 === toCol)) ||
                ((fromRow + 2 === toRow) && (fromCol - 1 === toCol)) ||
                ((fromRow - 2 === toRow) && (fromCol + 1 === toCol)) ||
                ((fromRow - 2 === toRow) && (fromCol - 1 === toCol)) ||
                ((fromRow + 1 === toRow) && (fromCol + 2 === toCol)) ||
                ((fromRow + 1 === toRow) && (fromCol - 2 === toCol)) ||
                ((fromRow - 1 === toRow) && (fromCol + 2 === toCol)) ||
                ((fromRow - 1 === toRow) && (fromCol - 2 === toCol));
        }
        if (piece === 'k' || piece === 'K') return true;
        return false;
    }

    internalIsKingInCheckAfterMove(piece, fromRow, fromCol, toRow, toCol, isWhitesTurn) {
        if (piece === 'k' || piece === 'K') return false;

        let kingRow = -1;
        let kingCol = -1;

        if (isWhitesTurn) {
            kingRow = this.pieceLocations.get("13").row;
            kingCol = this.pieceLocations.get("13").col;
        } else {
            kingRow = this.pieceLocations.get("5").row;
            kingCol = this.pieceLocations.get("5").col;
        }

        let isOnRowOrCol = (kingRow === fromRow || kingCol === fromCol);
        let key1 = fromRow * 8 + fromCol;
        let key2 = kingRow * 8 + kingCol;
        let isOnDiagonal = PgnConverter.fastDiagonalLookups.has(key1) && PgnConverter.fastDiagonalLookups.get(key1).has(key2);

        let rowWalk = kingRow < fromRow ? 1 : (kingRow === fromRow ? 0 : -1);
        let colWalk = kingCol < fromCol ? 1 : (kingCol === fromCol ? 0 : -1);

        if (isOnRowOrCol || isOnDiagonal) {
            kingRow += rowWalk;
            kingCol += colWalk;
            while (kingRow >= 0 && kingRow <= 7 && kingCol >= 0 && kingCol <= 7) {
                if (kingRow === toRow && kingCol === toCol) return false;

                if (!(kingRow === fromRow && kingCol === fromCol)) {
                    if (isWhitesTurn) {
                        if ((this.chessBoard[kingRow][kingCol] === "b" && isOnDiagonal) ||
                            (this.chessBoard[kingRow][kingCol] === "r" && isOnRowOrCol) ||
                            this.chessBoard[kingRow][kingCol] === "q") {
                            return true;
                        }
                    } else {
                        if ((this.chessBoard[kingRow][kingCol] === "B" && isOnDiagonal) ||
                            (this.chessBoard[kingRow][kingCol] === "R" && isOnRowOrCol) ||
                            this.chessBoard[kingRow][kingCol] === "Q") {
                            return true;
                        }
                    }
                    if (this.chessBoard[fromRow][fromCol] !== "") return false;
                }
                kingRow += rowWalk;
                kingCol += colWalk;
            }
        }
        return false;
    }

    getSmithNotationFromPGN(pgnNotation) {
        let gamesFound = this.getFullLinesFromPGN(pgnNotation);
        let gamesConverted = [];

        gamesFound.forEach(game => {
            let smithNotationMoves = [];

            try {
                this.resetBoardState();

                let isWhitesTurn = false;
                game.forEach(m => {
                    isWhitesTurn = !isWhitesTurn;

                    if (m === "O-O") {
                        this.castleKingside(isWhitesTurn);
                        smithNotationMoves.push(isWhitesTurn ? "e1g1" : "e8g8");
                        return;
                    }
                    if (m === "O-O-O") {
                        this.castleQueenside(isWhitesTurn);
                        smithNotationMoves.push(isWhitesTurn ? "e1c1" : "e8c8");
                        return;
                    }

                    let piece = m[0];
                    if ('a' <= piece && piece <= 'h') {
                        piece = isWhitesTurn ? 'P' : 'p';
                    } else {
                        if (!isWhitesTurn) {
                            switch (piece) {
                                case 'B': piece = 'b'; break;
                                case 'R': piece = 'r'; break;
                                case 'N': piece = 'n'; break;
                                case 'Q': piece = 'q'; break;
                                case 'K': piece = 'k'; break;
                            }
                        }
                    }

                    if (piece === 'p' || piece === 'P') {
                        this.handlePawnMove(m, piece, isWhitesTurn, smithNotationMoves);
                        return;
                    }

                    this.handlePieceMove(m, piece, isWhitesTurn, smithNotationMoves);
                });
            } catch (e) { }

            if (smithNotationMoves.length > 0) {
                gamesConverted.push(smithNotationMoves);
            }
        });

        return gamesConverted;
    }

    getFullLinesFromPGN(pgnNotation) {
        let pgnLines = pgnNotation.replace(/\r/g, "").split('\n');
        let cleanLine = [];
        let linesParse = [];
        let linesRet = [];
        let pgnGameStack = null;

        pgnLines.forEach(pgnLine => {
            let parseLine = pgnLine.trim();
            if (!parseLine.startsWith("1. ")) return;

            let lastLastLastChar = 'x';
            let lastLastChar = 'x';
            let lastChar = 'x';
            let skipStack = [];

            cleanLine = [];
            for (let i of parseLine) {
                if (PgnConverter.SkipChars.has(i)) {
                    continue;
                }
                if (i === '[' || i === '{' || i === '$') {
                    skipStack.push(i);
                }
                if (skipStack.length > 0) {
                    if ((i === ']' && skipStack[skipStack.length - 1] === '[') ||
                        (i === '}' && skipStack[skipStack.length - 1] === '{') ||
                        (i === ' ' && skipStack[skipStack.length - 1] === '$')) {
                        skipStack.pop();
                        continue;
                    }
                }
                if (skipStack.length === 0) {
                    if (i === ' ' && cleanLine[cleanLine.length - 1] === ' ') {
                        continue;
                    }
                    if (lastLastLastChar === ' ' && lastLastChar === '1' && lastChar === '.' && i === ' ') {
                        cleanLine.pop();
                        cleanLine.pop();
                        cleanLine.pop();
                        linesParse.push(cleanLine.join(""));
                        cleanLine = [];
                        cleanLine.push("1");
                        cleanLine.push(".");
                        cleanLine.push(" ");
                        continue;
                    }
                    lastLastLastChar = lastLastChar;
                    lastLastChar = lastChar;
                    lastChar = i;
                    cleanLine.push(i);
                }
            }
            if (cleanLine.length > 3) {
                linesParse.push(cleanLine.join(""));
                cleanLine = [];
            }
        });

        linesParse.forEach(pgn => {
            pgnGameStack = [];
            pgnGameStack.push([]);
            let movesList = pgn.split(' ');
            movesList.forEach(m => {
                if (m.startsWith("1/2") || m.startsWith("1-") || m.startsWith("0-")) return;

                let isNewSubline = m.startsWith("(");
                if (isNewSubline) {
                    let cloneTarget = pgnGameStack[pgnGameStack.length - 1];
                    let clonedGame = cloneTarget.slice(0, -1);
                    pgnGameStack.push(clonedGame);
                }

                let isEndSubline = m.endsWith(")");
                let move = m;
                if (isEndSubline || isNewSubline) move = move.replace(/[()]/g, '');

                if (!/^[0-9]/.test(move)) {
                    pgnGameStack[pgnGameStack.length - 1].push(move);
                }

                if (isEndSubline) {
                    linesRet.push(pgnGameStack.pop());
                }
            });
            linesRet.push(pgnGameStack.pop());
        });

        return linesRet;
    }

    resetBoardState() {
        this.chessBoard = [
            ["r", "n", "b", "q", "k", "b", "n", "r"],
            ["p", "p", "p", "p", "p", "p", "p", "p"],
            ["", "", "", "", "", "", "", ""],
            ["", "", "", "", "", "", "", ""],
            ["", "", "", "", "", "", "", ""],
            ["", "", "", "", "", "", "", ""],
            ["P", "P", "P", "P", "P", "P", "P", "P"],
            ["R", "N", "B", "Q", "K", "B", "N", "R"]
        ];
        this.chessBoardIDs = [
            ["1", "2", "3", "4", "5", "6", "7", "8"],
            ["", "", "", "", "", "", "", ""],
            ["", "", "", "", "", "", "", ""],
            ["", "", "", "", "", "", "", ""],
            ["", "", "", "", "", "", "", ""],
            ["", "", "", "", "", "", "", ""],
            ["", "", "", "", "", "", "", ""],
            ["9", "10", "11", "12", "13", "14", "15", "16"]
        ];
        this.uniquePieceIDs = new Map([
            ['r', new Set(["1", "8"])],
            ['n', new Set(["2", "7"])],
            ['b', new Set(["3", "6"])],
            ['q', new Set(["4"])],
            ['k', new Set(["5"])],
            ['R', new Set(["9", "16"])],
            ['N', new Set(["10", "15"])],
            ['B', new Set(["11", "14"])],
            ['Q', new Set(["12"])],
            ['K', new Set(["13"])]
        ]);
        this.pieceLocations = new Map([
            ["1", new Square(0, 0)],
            ["2", new Square(0, 1)],
            ["3", new Square(0, 2)],
            ["4", new Square(0, 3)],
            ["5", new Square(0, 4)],
            ["6", new Square(0, 5)],
            ["7", new Square(0, 6)],
            ["8", new Square(0, 7)],
            ["9", new Square(7, 0)],
            ["10", new Square(7, 1)],
            ["11", new Square(7, 2)],
            ["12", new Square(7, 3)],
            ["13", new Square(7, 4)],
            ["14", new Square(7, 5)],
            ["15", new Square(7, 6)],
            ["16", new Square(7, 7)]
        ]);
        this.nextID = 17;
    }

    castleKingside(isWhitesTurn) {
        if (isWhitesTurn) {
            this.chessBoard[7][4] = "";
            this.chessBoard[7][5] = "R";
            this.chessBoard[7][6] = "K";
            this.chessBoard[7][7] = "";
            this.chessBoardIDs[7][4] = "";
            this.chessBoardIDs[7][5] = "16";
            this.chessBoardIDs[7][6] = "13";
            this.chessBoardIDs[7][7] = "";
            this.pieceLocations.get("16").row = 7;
            this.pieceLocations.get("16").col = 5;
            this.pieceLocations.get("13").row = 7;
            this.pieceLocations.get("13").col = 6;
        } else {
            this.chessBoard[0][4] = "";
            this.chessBoard[0][5] = "8";
            this.chessBoard[0][6] = "5";
            this.chessBoard[0][7] = "";
            this.chessBoardIDs[0][4] = "";
            this.chessBoardIDs[0][5] = "8";
            this.chessBoardIDs[0][6] = "5";
            this.chessBoardIDs[0][7] = "";
            this.pieceLocations.get("8").row = 0;
            this.pieceLocations.get("8").col = 5;
            this.pieceLocations.get("5").row = 0;
            this.pieceLocations.get("5").col = 6;
        }
    }

    castleQueenside(isWhitesTurn) {
        if (isWhitesTurn) {
            this.chessBoard[7][4] = "";
            this.chessBoard[7][3] = "R";
            this.chessBoard[7][2] = "K";
            this.chessBoard[7][0] = "";
            this.chessBoardIDs[7][4] = "";
            this.chessBoardIDs[7][3] = "9";
            this.chessBoardIDs[7][2] = "13";
            this.chessBoardIDs[7][0] = "";
            this.pieceLocations.get("9").row = 7;
            this.pieceLocations.get("9").col = 3;
            this.pieceLocations.get("13").row = 7;
            this.pieceLocations.get("13").col = 2;
        } else {
            this.chessBoard[0][4] = "";
            this.chessBoard[0][3] = "r";
            this.chessBoard[0][2] = "k";
            this.chessBoard[0][0] = "";
            this.chessBoardIDs[0][4] = "";
            this.chessBoardIDs[0][3] = "1";
            this.chessBoardIDs[0][2] = "5";
            this.chessBoardIDs[0][0] = "";
            this.pieceLocations.get("1").row = 0;
            this.pieceLocations.get("1").col = 3;
            this.pieceLocations.get("5").row = 0;
            this.pieceLocations.get("5").col = 2;
        }
    }

    handlePawnMove(m, piece, isWhitesTurn, smithNotationMoves) {
        let isCapture = m.includes("x");
        let isUpgrade = m.includes("=");
        let upgrade = "";
        if (isUpgrade) {
            upgrade = m[m.length - 1];
        }
        if (isCapture) {
            let fromCol = PgnConverter.ColsChar[m[0]];
            let toRow = PgnConverter.RowsChar[m[3]];
            let toCol = PgnConverter.ColsChar[m[2]];
            let fromRow = toRow;
            if (isWhitesTurn) fromRow++;
            else fromRow--;
            this.internalMakeNextPgnMove(piece, fromRow, fromCol, toRow, toCol, upgrade, smithNotationMoves);
        } else {
            let toRow = PgnConverter.RowsChar[m[1]];
            let toCol = PgnConverter.ColsChar[m[0]];
            let fromRow = toRow;
            let fromCol = toCol;
            if (isWhitesTurn) {
                if (this.chessBoard[toRow + 1][toCol] === "P") fromRow = toRow + 1;
                else fromRow = toRow + 2;
            } else {
                if (this.chessBoard[toRow - 1][toCol] === "p") fromRow = toRow - 1;
                else fromRow = toRow - 2;
            }
            this.internalMakeNextPgnMove(piece, fromRow, fromCol, toRow, toCol, upgrade, smithNotationMoves);
        }
    }

    handlePieceMove(m, piece, isWhitesTurn, smithNotationMoves) {
        let mp = m.replace("x", "");
        let moveFound = false;
        if (mp.length === 5) {
            let toRow = PgnConverter.RowsChar[mp[4]];
            let toCol = PgnConverter.ColsChar[mp[3]];
            let fromRow = PgnConverter.RowsChar[mp[2]];
            let fromCol = PgnConverter.ColsChar[mp[1]];
            this.internalMakeNextPgnMove(piece, fromRow, fromCol, toRow, toCol, "", smithNotationMoves);
        } else if (mp.length === 4) {
            let toRow = PgnConverter.RowsChar[mp[3]];
            let toCol = PgnConverter.ColsChar[mp[2]];
            let fromRow = -1;
            let fromCol = PgnConverter.ColsChar[mp[1]];
            var idArr = this.uniquePieceIDs.get(piece.toString());
            idArr.forEach((id) => {
                var loc = this.pieceLocations.get(id);
                if (loc.col === fromCol) {
                    if (!this.internalIsKingInCheckAfterMove(piece, loc.row, loc.col, toRow, toCol, isWhitesTurn)) {
                        fromRow = loc.row;
                        this.internalMakeNextPgnMove(piece, fromRow, fromCol, toRow, toCol, "", smithNotationMoves);
                        moveFound = true;
                        return;
                    }
                }
            });
        } else if (mp.length === 3) {
            let toRow = PgnConverter.RowsChar[mp[2]];
            let toCol = PgnConverter.ColsChar[mp[1]];
            let fromRow = -1;
            let fromCol = -1;
            var idArr = this.uniquePieceIDs.get(piece.toString());
            idArr.forEach((id) => {
                var loc = this.pieceLocations.get(id);
                if (this.internalCanPieceMoveToLocation(piece, loc.row, loc.col, toRow, toCol)) {
                    if (!this.internalIsKingInCheckAfterMove(piece, loc.row, loc.col, toRow, toCol, isWhitesTurn)) {
                        fromCol = loc.col;
                        fromRow = loc.row;
                        this.internalMakeNextPgnMove(piece, fromRow, fromCol, toRow, toCol, "", smithNotationMoves);
                        moveFound = true;
                        return;
                    }
                }
            });
        }

        if (!moveFound) throw new Error("Invalid PGN cannot parse.");
    }
}