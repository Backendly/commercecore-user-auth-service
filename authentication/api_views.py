# api_views.py

from rest_framework import status
from rest_framework.response import Response
from rest_framework.decorators import api_view, authentication_classes
from rest_framework.authentication import TokenAuthentication
from .models import Developer, Organization
from .serializers import DeveloperSerializer, OrganizationSerializer
from .queries import (
    create_organization,
    update_organization,
    delete_organization,
    get_all_organizations,
    get_organization_by_id,
    create_developer,
    update_developer,
    delete_developer,
    get_all_developers,
    get_developer_by_id,
    regenerate_api_token,
    validate_api_token
)
import uuid

# Organization Views

@api_view(['POST'])
@authentication_classes([TokenAuthentication])
def create_organization_view(request):
    if request.user.is_authenticated:
        name = request.data.get('name')
        result = create_organization(name)
        if result['success']:
            return Response(result, status=status.HTTP_201_CREATED)
        return Response(result, status=status.HTTP_400_BAD_REQUEST)
    else:
        return Response({'success': False, 'message': 'Authentication failed'}, status=status.HTTP_401_UNAUTHORIZED)

@api_view(['PUT'])
@authentication_classes([TokenAuthentication])
def update_organization_view(request, org_id):
    if request.user.is_authenticated:
        name = request.data.get('name')
        result = update_organization(org_id, name)
        if result['success']:
            return Response(result, status=status.HTTP_200_OK)
        return Response(result, status=status.HTTP_400_BAD_REQUEST)
    else:
        return Response({'success': False, 'message': 'Authentication failed'}, status=status.HTTP_401_UNAUTHORIZED)

@api_view(['DELETE'])
@authentication_classes([TokenAuthentication])
def delete_organization_view(request, org_id):
    if request.user.is_authenticated:
        result = delete_organization(org_id)
        if result['success']:
            return Response(result, status=status.HTTP_200_OK)
        return Response(result, status=status.HTTP_400_BAD_REQUEST)
    else:
        return Response({'success': False, 'message': 'Authentication failed'}, status=status.HTTP_401_UNAUTHORIZED)

@api_view(['GET'])
@authentication_classes([TokenAuthentication])
def get_all_organizations_view(request):
    if request.user.is_authenticated:
        result = get_all_organizations()
        if result['success']:
            return Response(result, status=status.HTTP_200_OK)
        return Response(result, status=status.HTTP_400_BAD_REQUEST)
    else:
        return Response({'success': False, 'message': 'Authentication failed'}, status=status.HTTP_401_UNAUTHORIZED)

@api_view(['GET'])
@authentication_classes([TokenAuthentication])
def get_organization_by_id_view(request, org_id):
    if request.user.is_authenticated:
        result = get_organization_by_id(org_id)
        if result['success']:
            return Response(result, status=status.HTTP_200_OK)
        return Response(result, status=status.HTTP_400_BAD_REQUEST)
    else:
        return Response({'success': False, 'message': 'Authentication failed'}, status=status.HTTP_401_UNAUTHORIZED)

# Developer Views

@api_view(['POST'])
@authentication_classes([TokenAuthentication])
def create_developer_view(request):
    if request.user.is_authenticated:
        organization_id = request.data.get('organization_id')
        name = request.data.get('name')
        result = create_developer(organization_id, name)
        if result['success']:
            return Response(result, status=status.HTTP_201_CREATED)
        return Response(result, status=status.HTTP_400_BAD_REQUEST)
    else:
        return Response({'success': False, 'message': 'Authentication failed'}, status=status.HTTP_401_UNAUTHORIZED)

@api_view(['PUT'])
@authentication_classes([TokenAuthentication])
def update_developer_view(request, dev_id):
    if request.user.is_authenticated:
        name = request.data.get('name')
        result = update_developer(dev_id, name)
        if result['success']:
            return Response(result, status=status.HTTP_200_OK)
        return Response(result, status=status.HTTP_400_BAD_REQUEST)
    else:
        return Response({'success': False, 'message': 'Authentication failed'}, status=status.HTTP_401_UNAUTHORIZED)

@api_view(['DELETE'])
@authentication_classes([TokenAuthentication])
def delete_developer_view(request, dev_id):
    if request.user.is_authenticated:
        result = delete_developer(dev_id)
        if result['success']:
            return Response(result, status=status.HTTP_200_OK)
        return Response(result, status=status.HTTP_400_BAD_REQUEST)
    else:
        return Response({'success': False, 'message': 'Authentication failed'}, status=status.HTTP_401_UNAUTHORIZED)

@api_view(['GET'])
@authentication_classes([TokenAuthentication])
def get_all_developers_view(request):
    if request.user.is_authenticated:
        result = get_all_developers()
        if result['success']:
            return Response(result, status=status.HTTP_200_OK)
        return Response(result, status=status.HTTP_400_BAD_REQUEST)
    else:
        return Response({'success': False, 'message': 'Authentication failed'}, status=status.HTTP_401_UNAUTHORIZED)

@api_view(['GET'])
@authentication_classes([TokenAuthentication])
def get_developer_by_id_view(request, dev_id):
    if request.user.is_authenticated:
        result = get_developer_by_id(dev_id)
        if result['success']:
            return Response(result, status=status.HTTP_200_OK)
        return Response(result, status=status.HTTP_400_BAD_REQUEST)
    else:
        return Response({'success': False, 'message': 'Authentication failed'}, status=status.HTTP_401_UNAUTHORIZED)

@api_view(['POST'])
@authentication_classes([TokenAuthentication])
def regenerate_api_token_view(request, dev_id):
    if request.user.is_authenticated:
        result = regenerate_api_token(dev_id)
        if result['success']:
            return Response(result, status=status.HTTP_200_OK)
        return Response(result, status=status.HTTP_400_BAD_REQUEST)
    else:
        return Response({'success': False, 'message': 'Authentication failed'}, status=status.HTTP_401_UNAUTHORIZED)

@api_view(['POST'])
@authentication_classes([TokenAuthentication])
def validate_api_token_view(request, dev_id):
    if request.user.is_authenticated:
        token = request.data.get('token')
        result = validate_api_token(dev_id, token)
        if result['success']:
            return Response(result, status=status.HTTP_200_OK)
        return Response(result, status=status.HTTP_400_BAD_REQUEST)
    else:
        return Response({'success': False, 'message': 'Authentication failed'}, status=status.HTTP_401_UNAUTHORIZED)