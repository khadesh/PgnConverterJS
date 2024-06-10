# PgnConverterJS
PgnConverterJS is a small javascript library designed to very quickly perform a few tasks for converting to and from Pgn notation to smith notation (1. e4 e5 it to e2e4 e7e5 or reverse).

PgnConverterJS is a small javascript library designed to very quickly perform a few tasks: 

1) It can read a PGN string (or string of pgns all merged together) in, and break that file in an array of arrays of smith notation moves (instead of 1. e4 e5 it will give [['e2e4', 'e7e5']]), it will also create a new line for every subline it finds.
2) It can read a Smith notation string in and feedback a list of PGN moves.
3) It can also accept Smith notation one move at a time, and give a resulting FEN position after each step.
4) The FEN functionality only works when reading smith notation.

It does not error check for valid PGN files or positions, although it will error check PGN to smith conversion to ensure the correct piece is being moved.

It was built using ChatGPT-4o by feeding it a program written in C# and having it translated then debugging to resolve issues.

It is designed for high speed parsing and the C# version was capable of converting 25,000 PGN lines into Smith notation in under 1 second on my local PC.
