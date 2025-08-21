from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver
from django.db import models
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync
import json

@receiver([post_save, post_delete])
def notify_dashboard_update(sender, instance, **kwargs):
    # Only send signal for relevant models
    if sender._meta.app_label == 'insertData':
        channel_layer = get_channel_layer()
        async_to_sync(channel_layer.group_send)(
            "dashboard_updates",
            {
                "type": "dashboard_update",
                "message": {
                    "action": "refresh",
                    "model": sender._meta.model_name,
                }
            }
        )
