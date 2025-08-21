from channels.generic.websocket import AsyncWebsocketConsumer
import json

class DashboardConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        # Join the dashboard group
        await self.channel_layer.group_add("dashboard", self.channel_name)
        await self.accept()

    async def disconnect(self, close_code):
        # Leave the dashboard group
        await self.channel_layer.group_discard("dashboard", self.channel_name)

    async def receive(self, text_data):
        # Handle any messages received from the client
        # Currently not used but can be implemented for client-to-server communication
        pass

    async def send_message(self, event):
        # Send the message to the WebSocket
        message = event.get('message', {})
        await self.send(text_data=json.dumps(message))
