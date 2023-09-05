import json
import socket

# Set the path for the Unix socket
socket_path = "/tmp/app.github-preview-server"

# Create the Unix socket client
client = socket.socket(socket.AF_UNIX, socket.SOCK_STREAM)

# Connect to the server
client.connect(socket_path)

# the type must match the "eventName" defined in the server
message = {
    "type": 'python-event',
    "data": {
        "gualberto": "casas"
    }
}
# delimiter "\f" must be appended
client.send((json.dumps(message) + "\f").encode())

# Receive a response from the server
# response = client.recv(1024)
# print(f'Received response: {response.decode()}')

# Close the connection
client.close()
