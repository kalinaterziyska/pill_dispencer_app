from rest_framework import status, permissions
from rest_framework.views import APIView
from rest_framework.response import Response
from .models import Dispenser, Container, Schedule
from .serializers import (
    ContainerScheduleUpdateSerializer,
    # reuse the existing read-only container serializer:
    ContainerSerializer
)

class UpdateContainerSchedule(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def put(self, request):
        """
        Expects JSON:
        {
          "dispenser_name": "My Dispenser",
          "slot_number": 3,
          "schedules": [
            { "weekday": 0, "time": "10:00:00" },
            { "weekday": 4, "time": "17:00:00" }
          ]
        }
        """
        ser = ContainerScheduleUpdateSerializer(data=request.data)
        ser.is_valid(raise_exception=True)
        dn   = ser.validated_data["dispenser_name"]
        sn   = ser.validated_data["slot_number"]
        data = ser.validated_data["schedules"]

        # 1. find the dispenser
        try:
            disp = Dispenser.objects.get(owner=request.user, name=dn)
        except Dispenser.DoesNotExist:
            return Response({"detail":"Dispenser not found."},
                            status=status.HTTP_404_NOT_FOUND)

        # 2. find the container
        try:
            cont = Container.objects.get(dispenser=disp, slot_number=sn)
        except Container.DoesNotExist:
            return Response({"detail":"Container not found."},
                            status=status.HTTP_404_NOT_FOUND)

        # 3. wipe old schedules, create new ones
        cont.schedules.all().delete()
        for sched in data:
            Schedule.objects.create(
                container=cont,
                weekday=sched["weekday"],
                time=sched["time"]
            )

        # 4. return updated container (with nested schedules)
        updated = ContainerSerializer(cont).data
        return Response(updated, status=status.HTTP_200_OK)
