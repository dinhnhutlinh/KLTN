from rest_framework import serializers
from django.contrib.auth.models import User
from rest_framework.response import Response
from rest_framework import status
from rest_framework.validators import UniqueValidator
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate


class LoginSerializer(serializers.ModelSerializer):
    def login(self, attrs):
        username = attrs.get("username", "")
        password = attrs.get("password", "")

        if username and password:
            user = User.objects.filter(username=username).first()
            if user:
                if not user.check_password(password):
                    raise serializers.ValidationError("Incorrect Password")
            else:
                raise serializers.ValidationError("User not found")
        else:
            raise serializers.ValidationError("Username and Password are required")

        user = authenticate(username=username, password=password)

        if user and user.is_active:
            refresh = RefreshToken.for_user(user)
            return {
                "access": str(refresh.access_token),
            }
        raise serializers.ValidationError("User not found")

    class Meta:
        model = User
        fields = ["username", "password"]


# Serializer to Get User Details using Django Token Authentication
class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "first_name", "last_name", "username"]


# Serializer to Register User
class RegisterSerializer(serializers.ModelSerializer):
    email = serializers.EmailField(
        required=True, validators=[UniqueValidator(queryset=User.objects.all())]
    )
    password = serializers.CharField(write_only=True, required=True, min_length=6)
    confirm_password = serializers.CharField(write_only=True, required=True)

    class Meta:
        model = User
        fields = (
            "username",
            "password",
            "confirm_password",
            "email",
            "first_name",
            "last_name",
        )
        extra_kwargs = {
            "first_name": {"required": True},
            "last_name": {"required": True},
        }

    def validate(self, attrs):
        if attrs["password"] != attrs["confirm_password"]:
            raise serializers.ValidationError(
                {"password": "Password fields didn't match."}
            )
        return attrs

    def create(self, validated_data):
        user = User.objects.create(
            username=validated_data["username"],
            email=validated_data["email"],
            first_name=validated_data["first_name"],
            last_name=validated_data["last_name"],
        )
        user.set_password(validated_data["password"])
        user.save()
        return user
