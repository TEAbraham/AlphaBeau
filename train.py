import chess
from networks.version2 import Network

net = Network()
print("Training...")
net.train(steps=200)
print("Exporting...")
net.export()