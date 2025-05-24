from rest_framework import serializers
from .models import Container, Schedule

class ScheduleInputSerializer(serializers.Serializer):
    weekday = serializers.ChoiceField(choices=Schedule.WEEKDAYS)
    time    = serializers.TimeField()

class ContainerScheduleUpdateSerializer(serializers.Serializer):
    dispenser_name = serializers.CharField()
    slot_number    = serializers.IntegerField()
    schedules      = ScheduleInputSerializer(many=True)
