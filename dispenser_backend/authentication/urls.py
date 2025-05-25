from rest_framework_simplejwt.views import TokenObtainPairView
from django.urls import path

from .views import (
    RegisterView, 
    LoginView, 
    LogoutView,
    GetUserView,
    RefreshAccessTokenView
    )

urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', LoginView.as_view(), name='login'),
    path('logout/', LogoutView.as_view(), name='logout'),
    path('token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', RefreshAccessTokenView.as_view(), name='token_refresh'),
    path('user/', GetUserView.as_view(), name='get_user')
]
