from django.db import models
from django.contrib.auth.models import User

# dispenser/models.py

class Dispenser(models.Model):
    owner = models.ForeignKey(User, on_delete=models.CASCADE, related_name="dispensers")
    name = models.CharField(max_length=100)

    class Meta:
        unique_together = ("owner", "name")
        ordering = ["name"]

    def __str__(self):
        return f"{self.name} (owned by {self.owner.username})"



class Container(models.Model):
    """
    One physical slot in the dispenser.
    slot_number lets you distinguish container #1, #2, etc.
    pill_name is whatever pills you load in it.
    """
    dispenser = models.ForeignKey(Dispenser, on_delete=models.CASCADE, related_name="containers")
    slot_number = models.PositiveIntegerField()
    pill_name = models.CharField(max_length=100)

    class Meta:
        unique_together = ("dispenser", "slot_number")
        ordering = ["slot_number"]

    def __str__(self):
        return f"Slot {self.slot_number}: {self.pill_name}"


class Schedule(models.Model):
    """
    A single “drop” event: on a given weekday at a given time, for one container.
    You’ll create one Schedule per (weekday × time × container).
    """
    WEEKDAYS = [
        (0, "Monday"),
        (1, "Tuesday"),
        (2, "Wednesday"),
        (3, "Thursday"),
        (4, "Friday"),
        (5, "Saturday"),
        (6, "Sunday"),
    ]

    container = models.ForeignKey(Container, on_delete=models.CASCADE, related_name="schedules")
    weekday = models.IntegerField(choices=WEEKDAYS)
    time = models.TimeField()

    class Meta:
        ordering = ["container", "weekday", "time"]

    def __str__(self):
        return f"{self.container} → {self.get_weekday_display()} at {self.time}"
