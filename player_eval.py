# I absolutely hate this sys path stuff
import sys
sys.path.append(sys.path[0] + "/..")

import chess
import os
import time
import datetime
import pychess_utils as util

from chess import pgn
from deepmind_mcts import MCTS

# This should eventually go up to 400
EVAL_GAMES = 20

# latest version is default for MCTS
latest_player = MCTS(startpos=chess.Board())

# util grabs best version number from storage
best_player = MCTS(startpos=chess.Board(), version=util.best_version())

def play_game(best_player_starts=True):
	turn = True
	if best_player_starts:
		player1 = best_player
		player2 = latest_player
	else:
		player1 = latest_player
		player2 = best_player

	board = player1.startpos
	move_count = 0
	clock = 0
	next_temp = True
	while not board.is_game_over(claim_draw=True) and not move_count >= 200:
		if turn:
			player = player1
		else:
			player = player2

		# Build new tree
		
		player.build()
		begin = time.time()
		move = player.best_move()
		# Execute the move selected by MCTS
		board.push(move)
		move_count += 1
		if move_count % 2 == 0:
			plays = "Black's"
		else:
			plays = "White's"
		# Stop exploring so much after 15 moves
		if move_count == 200:
			next_temp = False
		print(f'		{plays} Move: {move.uci()}			')
		print(f"{board}")
		time_elapsed = time.time() - begin
		clock += time_elapsed
		print(f"  Turn: {move_count} | MCTS: {time_elapsed:.4f} sec | Clock: {(clock/60):.4f} min")
		print(f'--------------------{best_player.version} vs {latest_player.version}--------------------')

		# Salvage existing statistics about the position
		if turn:
			player2 = MCTS(startpos=board, prev_mcts=player, temperature=next_temp, startcolor=board.turn)
		else:
			player1 = MCTS(startpos=board, prev_mcts=player, temperature=next_temp, startcolor=board.turn)
		turn = not turn

	latest_player_result = util.decode_result(board.result(claim_draw=True), not best_player_starts) if move_count < 200 else 0.5

	return latest_player_result

def main():
	for i in range(EVAL_GAMES):
		results = 0
		# Switch off who plays as white
		results += play_game(best_player_starts=(i % 2 == 0))

	if results >= (EVAL_GAMES*0.55):
		print("New player won!")
		# The new player won 55+% of the games and should be promoted to the best
		util.update_best_player(latest_player.version)
	else:
		print("New player did not reach 55% wins, best player unchanged.")

if __name__ == "__main__":
    main()