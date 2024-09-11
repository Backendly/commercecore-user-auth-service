from rest_framework import serializers
from .models import (
    Developer,
    Organization,
    DeveloperOrganization,
    User,
    UserProfile,
    Token,
    Role,
    Permission,
    UserRole,
    RolePermission,
)

class DeveloperSerializer(serializers.ModelSerializer):
    class Meta:
        model = Developer
        fields = ['name', 'is_active', 'created_at', 'updated_at']
        extra_kwargs = {
            'api_token': {'write_only': True},
            'id': {'write_only': True}
        }

class OrganizationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Organization
        fields = '__all__'

class DeveloperOrganizationSerializer(serializers.ModelSerializer):
    developer = DeveloperSerializer(read_only=True)
    developer_id = serializers.PrimaryKeyRelatedField(
        queryset=Developer.objects.all(),
        write_only=True,
        source='developer'
    )
    organization = OrganizationSerializer(read_only=True)
    organization_id = serializers.PrimaryKeyRelatedField(
        queryset=Organization.objects.all(),
        write_only=True,
        source='organization'
    )

    class Meta:
        model = DeveloperOrganization
        fields = '__all__'
        extra_kwargs = {
            'role': {'required': False}
        }

class UserProfileSerializer(serializers.ModelSerializer):
    user = serializers.StringRelatedField(read_only=True)
    user_id = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.all(),
        write_only=True,
        source='user'
    )

    class Meta:
        model = UserProfile
        fields = '__all__'

class UserSerializer(serializers.ModelSerializer):
    developer = DeveloperSerializer(read_only=True)
    developer_id = serializers.PrimaryKeyRelatedField(
        queryset=Developer.objects.all(),
        write_only=True,
        source='developer'
    )
    profile = UserProfileSerializer(read_only=True)

    class Meta:
        model = User
        fields = [
            'id', 'developer', 'developer_id', 'email', 'password', 'is_active', 
            'is_staff', 'created_at', 'updated_at', 'profile'
        ]
        extra_kwargs = {
            'id': {'write_only': True},
            'developer_id': {'write_only': True},
            'password': {'write_only': True}
        }

class TokenSerializer(serializers.ModelSerializer):
    developer = DeveloperSerializer(read_only=True)
    developer_id = serializers.PrimaryKeyRelatedField(
        queryset=Developer.objects.all(),
        write_only=True,
        source='developer'
    )

    class Meta:
        model = Token
        fields = '__all__'
        extra_kwargs = {
            'id': {'write_only': True},
            'token': {'write_only': True}
        }

class RoleSerializer(serializers.ModelSerializer):
    class Meta:
        model = Role
        fields = '__all__'

class PermissionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Permission
        fields = '__all__'

class UserRoleSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    user_id = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.all(),
        write_only=True,
        source='user'
    )
    role = RoleSerializer(read_only=True)
    role_id = serializers.PrimaryKeyRelatedField(
        queryset=Role.objects.all(),
        write_only=True,
        source='role'
    )

    class Meta:
        model = UserRole
        fields = '__all__'

class RolePermissionSerializer(serializers.ModelSerializer):
    role = RoleSerializer(read_only=True)
    role_id = serializers.PrimaryKeyRelatedField(
        queryset=Role.objects.all(),
        write_only=True,
        source='role'
    )
    permission = PermissionSerializer(read_only=True)
    permission_id = serializers.PrimaryKeyRelatedField(
        queryset=Permission.objects.all(),
        write_only=True,
        source='permission'
    )

    class Meta:
        model = RolePermission
        fields = '__all__'