# api_views.py

from rest_framework import status
from rest_framework.response import Response
from rest_framework.decorators import api_view, authentication_classes, permission_classes
from rest_framework.authentication import TokenAuthentication
from rest_framework.permissions import IsAuthenticated
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
    validate_api_token,
)

# Organization Views

@api_view(['POST'])
@authentication_classes([TokenAuthentication])
@permission_classes([IsAuthenticated])
def create_organization_view(request):
    name = request.data.get('name')
    if not name:
        return Response({'success': False, 'message': 'Name is required'}, status=status.HTTP_400_BAD_REQUEST)
    
    result = create_organization(name)
    if result['success']:
        return Response(result, status=status.HTTP_201_CREATED)
    return Response(result, status=status.HTTP_400_BAD_REQUEST)

@api_view(['PUT'])
@authentication_classes([TokenAuthentication])
@permission_classes([IsAuthenticated])
def update_organization_view(request, org_id):
    name = request.data.get('name')
    if not name:
        return Response({'success': False, 'message': 'Name is required'}, status=status.HTTP_400_BAD_REQUEST)
    
    result = update_organization(org_id, name)
    if result['success']:
        return Response(result, status=status.HTTP_200_OK)
    return Response(result, status=status.HTTP_400_BAD_REQUEST)

@api_view(['DELETE'])
@authentication_classes([TokenAuthentication])
@permission_classes([IsAuthenticated])
def delete_organization_view(request, org_id):
    result = delete_organization(org_id)
    if result['success']:
        return Response(result, status=status.HTTP_200_OK)
    return Response(result, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
@authentication_classes([TokenAuthentication])
@permission_classes([IsAuthenticated])
def get_all_organizations_view(request):
    result = get_all_organizations()
    if result['success']:
        return Response(result, status=status.HTTP_200_OK)
    return Response(result, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
@authentication_classes([TokenAuthentication])
@permission_classes([IsAuthenticated])
def get_organization_by_id_view(request, org_id):
    result = get_organization_by_id(org_id)
    if result['success']:
        return Response(result, status=status.HTTP_200_OK)
    return Response(result, status=status.HTTP_404_NOT_FOUND)

# Developer Views

@api_view(['POST'])
@authentication_classes([TokenAuthentication])
@permission_classes([IsAuthenticated])
def create_developer_view(request):
    organization_id = request.data.get('organization_id')
    name = request.data.get('name')
    if not organization_id or not name:
        return Response({'success': False, 'message': 'Organization ID and name are required'}, status=status.HTTP_400_BAD_REQUEST)
    
    result = create_developer(organization_id, name)
    if result['success']:
        return Response(result, status=status.HTTP_201_CREATED)
    return Response(result, status=status.HTTP_400_BAD_REQUEST)

@api_view(['PUT'])
@authentication_classes([TokenAuthentication])
@permission_classes([IsAuthenticated])
def update_developer_view(request, dev_id):
    name = request.data.get('name')
    if not name:
        return Response({'success': False, 'message': 'Name is required'}, status=status.HTTP_400_BAD_REQUEST)
    
    result = update_developer(dev_id, name)
    if result['success']:
        return Response(result, status=status.HTTP_200_OK)
    return Response(result, status=status.HTTP_400_BAD_REQUEST)

@api_view(['DELETE'])
@authentication_classes([TokenAuthentication])
@permission_classes([IsAuthenticated])
def delete_developer_view(request, dev_id):
    result = delete_developer(dev_id)
    if result['success']:
        return Response(result, status=status.HTTP_200_OK)
    return Response(result, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
@authentication_classes([TokenAuthentication])
@permission_classes([IsAuthenticated])
def get_all_developers_view(request):
    result = get_all_developers()
    if result['success']:
        return Response(result, status=status.HTTP_200_OK)
    return Response(result, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
@authentication_classes([TokenAuthentication])
@permission_classes([IsAuthenticated])
def get_developer_by_id_view(request, dev_id):
    result = get_developer_by_id(dev_id)
    if result['success']:
        return Response(result, status=status.HTTP_200_OK)
    return Response(result, status=status.HTTP_404_NOT_FOUND)

@api_view(['POST'])
@authentication_classes([TokenAuthentication])
@permission_classes([IsAuthenticated])
def regenerate_api_token_view(request, dev_id):
    result = regenerate_api_token(dev_id)
    if result['success']:
        return Response(result, status=status.HTTP_200_OK)
    return Response(result, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@authentication_classes([TokenAuthentication])
@permission_classes([IsAuthenticated])
def validate_api_token_view(request, dev_id):
    token = request.data.get('token')
    if not token:
        return Response({'success': False, 'message': 'Token is required'}, status=status.HTTP_400_BAD_REQUEST)
    
    result = validate_api_token(dev_id, token)
    if result['success']:
        return Response(result, status=status.HTTP_200_OK)
    return Response(result, status=status.HTTP_400_BAD_REQUEST)
