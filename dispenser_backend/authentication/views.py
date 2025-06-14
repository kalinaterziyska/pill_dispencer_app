from .serializers import RegisterSerializer, LoginSerializer, UserSerializer
from rest_framework_simplejwt.serializers import TokenRefreshSerializer
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework_simplejwt.views import TokenRefreshView
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.response import Response
from rest_framework.views import APIView    
from rest_framework import status, views, permissions
from datetime import datetime
from .models import User

class RegisterView(APIView):
    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            refresh = RefreshToken.for_user(user)
            userData = UserSerializer(user).data
            return Response({
                'access': str(refresh.access_token),
                'refresh': str(refresh),
                'user': userData
            }, status=status.HTTP_200_OK)
        
        errorMessages = " ".join([" ".join(messages) for messages in serializer.errors.values()])
        return Response({"detail": errorMessages}, status=status.HTTP_400_BAD_REQUEST)

class LoginView(views.APIView):
    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.validated_data['user']
            refresh = RefreshToken.for_user(user)
            userData = UserSerializer(user).data
            return Response({
                'access': str(refresh.access_token),
                'refresh': str(refresh),
                'user': userData
            }, status=status.HTTP_200_OK)
        
        errorMessages = " ".join([" ".join(messages) for messages in serializer.errors.values()])
        return Response({"detail": errorMessages}, status=status.HTTP_400_BAD_REQUEST)
    

class LogoutView(APIView):
    def post(self, request):
        try:
            refreshToken = request.data.get("refresh")
            if refreshToken is None:
                return Response({"detail": "Refresh token is required."}, status=status.HTTP_400_BAD_REQUEST)
            
            token = RefreshToken(refreshToken)
            token.blacklist()

            return Response({"detail": "Logout successful."}, status=status.HTTP_205_RESET_CONTENT)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

# class GetAllUsersView(APIView):
#     permission_classes = [permissions.IsAuthenticated, permissions.IsAdminUser]
#     def get(self, request):
#         users = User.objects.all()        
#         serializer = UserSerializer(users, many=True)        
#         return Response(serializer.data, status=status.HTTP_200_OK)
 
class GetUserView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    def get(self, request):
        user = User.objects.get(username=request.user.username)
        return Response({
            'email': user.email,
            'username': user.username,
            'phoneNumber': user.phoneNumber,
        }, status=status.HTTP_200_OK)
    
class RefreshAccessTokenView(TokenRefreshView):
    serializer_class = TokenRefreshSerializer

