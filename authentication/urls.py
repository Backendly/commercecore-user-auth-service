# authentication/urls.py

from django.urls import path, include, register_converter
from django.urls.converters import UUIDConverter
from rest_framework.routers import DefaultRouter
from authentication.views import (
    OrganizationViewSet, DeveloperViewSet, UserViewSet, UserProfileViewSet,
    TokenViewSet, RoleViewSet, PermissionViewSet, UserRoleViewSet, RolePermissionViewSet
)
from .api_views import (
    create_organization_view,
    update_organization_view,
    delete_organization_view,
    get_all_organizations_view,
    get_organization_by_id_view,
    create_developer_view,
    update_developer_view,
    delete_developer_view,
    get_all_developers_view,
    get_developer_by_id_view,
    regenerate_api_token_view,
    validate_api_token_view
)

# Register the UUID converter
register_converter(UUIDConverter, 'uuid')

router = DefaultRouter()
router.register(r'organizations', OrganizationViewSet)
router.register(r'developers', DeveloperViewSet)
router.register(r'users', UserViewSet)
router.register(r'user-profiles', UserProfileViewSet)
router.register(r'tokens', TokenViewSet)
router.register(r'roles', RoleViewSet)
router.register(r'permissions', PermissionViewSet)
router.register(r'user-roles', UserRoleViewSet)
router.register(r'role-permissions', RolePermissionViewSet)

urlpatterns = [
    path('', include(router.urls)),
    
    # Organization URLs
    path('organizations/create/', create_organization_view, name='create_organization'),
    path('organizations/<uuid:org_id>/update/', update_organization_view, name='update_organization'),
    path('organizations/<uuid:org_id>/delete/', delete_organization_view, name='delete_organization'),
    path('organizations/all/', get_all_organizations_view, name='get_all_organizations'),
    path('organizations/<uuid:org_id>/', get_organization_by_id_view, name='get_organization_by_id'),

    # Developer URLs
    path('developers/create/', create_developer_view, name='create_developer'),
    path('developers/<uuid:dev_id>/update/', update_developer_view, name='update_developer'),
    path('developers/<uuid:dev_id>/delete/', delete_developer_view, name='delete_developer'),
    path('developers/all/', get_all_developers_view, name='get_all_developers'),
    path('developers/<uuid:dev_id>/', get_developer_by_id_view, name='get_developer_by_id'),
    path('developers/<uuid:dev_id>/regenerate-token/', regenerate_api_token_view, name='regenerate_api_token'),
    path('developers/<uuid:dev_id>/validate-token/', validate_api_token_view, name='validate_api_token'),
]