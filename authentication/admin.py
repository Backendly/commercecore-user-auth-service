# admin.py

from django.contrib import admin
from .models import Organization, Developer, User, UserProfile, Token, Role, Permission, UserRole, RolePermission

admin.site.register(Organization)
admin.site.register(Developer)
admin.site.register(User)
admin.site.register(UserProfile)
admin.site.register(Token)
admin.site.register(Role)
admin.site.register(Permission)
admin.site.register(UserRole)
admin.site.register(RolePermission)


