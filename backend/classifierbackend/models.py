from django.db import models

class Conversation(models.Model):
    content = models.TextField()
    num = models.IntegerField()
    def __str__(self):
        return f"Conversation {self.num}"