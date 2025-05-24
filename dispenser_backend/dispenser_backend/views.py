from rest_framework import generics, status, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from django.db import transaction
from .models import Dispenser, Container, Schedule
from .serializers import (
    DispenserSerializer,
    ContainerSerializer,
    ScheduleSerializer,
    RegisterDispenserSerializer,
    ContainerScheduleUpdateSerializer,
    UpdatePillNameSerializer,
    UpdateDispenserNameSerializer
)

class RegisterDispenserView(generics.CreateAPIView):
    serializer_class = RegisterDispenserSerializer
    permission_classes = [permissions.IsAuthenticated]

    @transaction.atomic
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        # Extract size from serial ID (first character)
        size = serializer.validated_data['serial_id'][0]

        # Create dispenser
        dispenser = Dispenser.objects.create(
            owner=request.user,
            name=serializer.validated_data['name'],
            serial_id=serializer.validated_data['serial_id'],
            size=size
        )

        # Initialize containers and schedules
        dispenser.initialize_containers()

        # Return the created dispenser with all its containers and schedules
        response_serializer = DispenserSerializer(dispenser)
        return Response(response_serializer.data, status=status.HTTP_201_CREATED)

class UpdateContainerSchedule(generics.UpdateAPIView):
    serializer_class = ContainerScheduleUpdateSerializer
    permission_classes = [permissions.IsAuthenticated]

    @transaction.atomic
    def update(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        # Get the dispenser and verify ownership
        try:
            dispenser = Dispenser.objects.get(
                owner=request.user,
                name=serializer.validated_data['dispenser_name']
            )
        except Dispenser.DoesNotExist:
            return Response(
                {"detail": "Dispenser not found"},
                status=status.HTTP_404_NOT_FOUND
            )

        # Get the container
        try:
            container = Container.objects.get(
                dispenser=dispenser,
                slot_number=serializer.validated_data['slot_number']
            )
        except Container.DoesNotExist:
            return Response(
                {"detail": "Container not found"},
                status=status.HTTP_404_NOT_FOUND
            )

        # Update container pill name
        container.pill_name = serializer.validated_data['pill_name']
        container.save()

        # Delete existing schedules
        container.schedules.all().delete()

        # Create new schedules
        new_schedules = []
        for schedule_data in serializer.validated_data['schedules']:
            schedule = Schedule.objects.create(
                container=container,
                weekday=schedule_data['weekday'],
                time=schedule_data['time'],
            )
            new_schedules.append(schedule)

        # Return the updated container with its new schedules
        response_serializer = ContainerSerializer(container)
        return Response(response_serializer.data)

class DispenserView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        ser = DispenserSerializer(data=request.data)
        ser.is_valid(raise_exception=True)
        ser.save()
        return Response(ser.data, status=status.HTTP_201_CREATED)

class UpdatePillNameView(generics.UpdateAPIView):
    serializer_class = UpdatePillNameSerializer
    permission_classes = [permissions.IsAuthenticated]

    def update(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        try:
            dispenser = Dispenser.objects.get(
                owner=request.user,
                name=serializer.validated_data['dispenser_name']
            )
        except Dispenser.DoesNotExist:
            return Response(
                {"detail": "Dispenser not found"},
                status=status.HTTP_404_NOT_FOUND
            )

        try:
            container = Container.objects.get(
                dispenser=dispenser,
                slot_number=serializer.validated_data['slot_number']
            )
        except Container.DoesNotExist:
            return Response(
                {"detail": "Container not found"},
                status=status.HTTP_404_NOT_FOUND
            )

        container.pill_name = serializer.validated_data['pill_name']
        container.save()

        response_serializer = ContainerSerializer(container)
        return Response(response_serializer.data)

class UpdateDispenserNameView(generics.UpdateAPIView):
    serializer_class = UpdateDispenserNameSerializer
    permission_classes = [permissions.IsAuthenticated]

    def update(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        try:
            dispenser = Dispenser.objects.get(
                owner=request.user,
                name=serializer.validated_data['current_name']
            )
        except Dispenser.DoesNotExist:
            return Response(
                {"detail": "Dispenser not found"},
                status=status.HTTP_404_NOT_FOUND
            )

        dispenser.name = serializer.validated_data['new_name']
        dispenser.save()

        response_serializer = DispenserSerializer(dispenser)
        return Response(response_serializer.data)

class DeleteDispenserView(generics.DestroyAPIView):
    permission_classes = [permissions.IsAuthenticated]
    lookup_field = 'name'
    queryset = Dispenser.objects.all()

    def get_queryset(self):
        return Dispenser.objects.filter(owner=self.request.user)

    def destroy(self, request, *args, **kwargs):
        try:
            instance = self.get_object()
            self.perform_destroy(instance)
            return Response(
                {"detail": "Dispenser successfully deleted"},
                status=status.HTTP_200_OK
            )
        except Dispenser.DoesNotExist:
            return Response(
                {"detail": "Dispenser not found"},
                status=status.HTTP_404_NOT_FOUND
            )
        
