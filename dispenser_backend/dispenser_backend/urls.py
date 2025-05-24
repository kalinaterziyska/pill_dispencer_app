"""
URL configuration for dispenser_backend project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.urls import path, include
from .views import (
    UpdateContainerSchedule,
    RegisterDispenserView,
    UpdatePillNameView,
    UpdateDispenserNameView,
    DeleteDispenserView
)


urlpatterns = [
    path('api/container-schedule/', UpdateContainerSchedule.as_view(), name='update-container-schedule'),
    path('api/register-dispenser/', RegisterDispenserView.as_view(), name='register-dispenser'),
    path('api/update-pill-name/', UpdatePillNameView.as_view(), name='update-pill-name'),
    path('api/update-dispenser-name/', UpdateDispenserNameView.as_view(), name='update-dispenser-name'),
    path('api/delete-dispenser/<str:name>/', DeleteDispenserView.as_view(), name='delete-dispenser'),
    path('authentication/', include('authentication.urls')),
]
