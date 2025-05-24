# dispenser/serializers.py

from rest_framework import serializers
from .models import Dispenser, Container, Schedule
from django.core.exceptions import ValidationError
from django.utils.translation import gettext_lazy as _
import re

class ScheduleInputSerializer(serializers.Serializer):
    weekday = serializers.ChoiceField(choices=Schedule.WEEKDAYS)
    time    = serializers.TimeField()

class ContainerScheduleUpdateSerializer(serializers.Serializer):
    dispenser_name = serializers.CharField()
    slot_number    = serializers.IntegerField()
    schedules      = ScheduleInputSerializer(many=True)
    pill_name      = serializers.CharField(required=False)

class ScheduleSerializer(serializers.ModelSerializer):
    class Meta:
        model = Schedule
        fields = ['id', 'container', 'weekday', 'time']

    def validate_weekday(self, value):
        if not 0 <= value <= 6:
            raise serializers.ValidationError(_("Weekday must be between 0 (Monday) and 6 (Sunday)"))
        return value

    def validate(self, data):
        # Check if there's already a schedule for this container at the same weekday and time
        if self.instance is None:  # Only check on creation
            existing = Schedule.objects.filter(
                container=data['container'],
                weekday=data['weekday'],
                time=data['time']
            ).exists()
            if existing:
                raise serializers.ValidationError(
                    _("A schedule for this container at this weekday and time already exists")
                )
        return data


class ContainerSerializer(serializers.ModelSerializer):
    schedules = ScheduleSerializer(many=True, read_only=True)

    class Meta:
        model = Container
        fields = ['id', 'dispenser', 'slot_number', 'pill_name', 'schedules']

    def validate_slot_number(self, value):
        if value < 1:
            raise serializers.ValidationError(_("Slot number must be positive"))
        return value

    def validate(self, data):
        # Check if slot_number is unique for this dispenser
        if self.instance is None:  # Only check on creation
            existing = Container.objects.filter(
                dispenser=data['dispenser'],
                slot_number=data['slot_number']
            ).exists()
            if existing:
                raise serializers.ValidationError(
                    _("This slot number is already in use for this dispenser")
                )
        
        # Validate pill name is not empty
        if not data.get('pill_name', '').strip():
            raise serializers.ValidationError(_("Pill name cannot be empty"))

        # Maximum number of containers per dispenser (e.g., 8 slots)
        MAX_SLOTS = 8
        if self.instance is None:  # Only check on creation
            current_count = Container.objects.filter(dispenser=data['dispenser']).count()
            if current_count >= MAX_SLOTS:
                raise serializers.ValidationError(
                    _(f"A dispenser cannot have more than {MAX_SLOTS} containers")
                )

        return data


class DispenserSerializer(serializers.ModelSerializer):
    containers = ContainerSerializer(many=True, read_only=True)
    owner = serializers.ReadOnlyField(source='owner.username')

    class Meta:
        model = Dispenser
        fields = ['id', 'name', 'owner', 'containers']

    def validate_name(self, value):
        # Check name length
        if len(value.strip()) < 3:
            raise serializers.ValidationError(_("Dispenser name must be at least 3 characters long"))
        
        # Check for special characters
        if not re.match(r'^[a-zA-Z0-9\s\-_]+$', value):
            raise serializers.ValidationError(_("Dispenser name can only contain letters, numbers, spaces, hyphens, and underscores"))
        
        return value.strip()

    def validate(self, data):
        # Check if name is unique for this owner
        if self.instance is None:  # Only check on creation
            request = self.context.get('request')
            if request and request.user:
                existing = Dispenser.objects.filter(
                    owner=request.user,
                    name=data['name']
                ).exists()
                if existing:
                    raise serializers.ValidationError(
                        _("You already have a dispenser with this name")
                    )

        # Maximum number of dispensers per user (e.g., 5)
        MAX_DISPENSERS = 5
        if self.instance is None:  # Only check on creation
            request = self.context.get('request')
            if request and request.user:
                current_count = Dispenser.objects.filter(owner=request.user).count()
                if current_count >= MAX_DISPENSERS:
                    raise serializers.ValidationError(
                        _(f"You cannot have more than {MAX_DISPENSERS} dispensers")
                    )

        return data


class RegisterDispenserSerializer(serializers.Serializer):
    serial_id = serializers.CharField(max_length=20)
    name = serializers.CharField(max_length=100)

    def validate_serial_id(self, value):
        # Serial ID format: SIZE-YYYYMMDD-XXXX
        # Example: S-20250524-0001 (Small dispenser manufactured on May 24, 2025, unit 0001)
        pattern = r'^[SML]-\d{8}-\d{4}$'
        if not re.match(pattern, value):
            raise serializers.ValidationError(
                _("Invalid serial ID format. Expected format: SIZE-YYYYMMDD-XXXX (e.g., S-20250524-0001)")
            )
        
        # Check if serial ID already registered
        if Dispenser.objects.filter(serial_id=value).exists():
            raise serializers.ValidationError(_("This dispenser is already registered"))

        return value

    def validate_name(self, value):
        if len(value.strip()) < 3:
            raise serializers.ValidationError(_("Dispenser name must be at least 3 characters long"))
        
        if not re.match(r'^[a-zA-Z0-9\s\-_]+$', value):
            raise serializers.ValidationError(
                _("Dispenser name can only contain letters, numbers, spaces, hyphens, and underscores")
            )
        
        return value.strip()

    def validate(self, data):
        # Check if user already has a dispenser with this name
        request = self.context.get('request')
        if request and request.user:
            if Dispenser.objects.filter(owner=request.user, name=data['name']).exists():
                raise serializers.ValidationError(_("You already have a dispenser with this name"))

        return data


class UpdatePillNameSerializer(serializers.Serializer):
    dispenser_name = serializers.CharField()
    slot_number = serializers.IntegerField()
    pill_name = serializers.CharField(max_length=100)

    def validate_pill_name(self, value):
        if not value.strip():
            raise serializers.ValidationError(_("Pill name cannot be empty"))
        return value.strip()


class UpdateDispenserNameSerializer(serializers.Serializer):
    current_name = serializers.CharField()
    new_name = serializers.CharField(max_length=100)

    def validate_new_name(self, value):
        if len(value.strip()) < 3:
            raise serializers.ValidationError(_("Dispenser name must be at least 3 characters long"))
        
        if not re.match(r'^[a-zA-Z0-9\s\-_]+$', value):
            raise serializers.ValidationError(
                _("Dispenser name can only contain letters, numbers, spaces, hyphens, and underscores")
            )
        
        return value.strip()

    def validate(self, data):
        request = self.context.get('request')
        if request and request.user:
            if Dispenser.objects.filter(
                owner=request.user,
                name=data['new_name']
            ).exists():
                raise serializers.ValidationError(_("You already have a dispenser with this name"))
        return data
