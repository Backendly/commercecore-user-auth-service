import logging
import uuid
from datetime import timedelta
from django.utils import timezone
from django.core.exceptions import ObjectDoesNotExist, ValidationError
from django.db import transaction
from .models import Developer, Organization
from .serializers import DeveloperSerializer, OrganizationSerializer
from .error import (
    OrganizationNotFoundError,
    DeveloperNotFoundError,
    TokenExpiredError,
    handle_validation_error,
    handle_unexpected_error
)

# Configure logging
logger = logging.getLogger(__name__)

# Organization Queries

def create_organization(name):
    try:
        with transaction.atomic():
            organization = Organization.objects.create(name=name)
            logger.info(f"Organization created: {organization.id}")
            serialized_data = OrganizationSerializer(organization).data
        return {"success": True, "organization": serialized_data}
    except ValidationError as e:
        return handle_validation_error(e)
    except Exception as e:
        return handle_unexpected_error(e)

def update_organization(org_id, name):
    try:
        with transaction.atomic():
            organization = Organization.objects.get(id=org_id, deleted_at__isnull=True)
            organization.name = name
            organization.save()
            logger.info(f"Organization updated: {organization.id}")
            serialized_data = OrganizationSerializer(organization).data
        return {"success": True, "organization": serialized_data}
    except ObjectDoesNotExist:
        raise OrganizationNotFoundError(org_id)
    except ValidationError as e:
        return handle_validation_error(e)
    except Exception as e:
        return handle_unexpected_error(e)

def delete_organization(org_id):
    try:
        with transaction.atomic():
            organization = Organization.objects.get(id=org_id, deleted_at__isnull=True)
            organization.deleted_at = timezone.now()
            organization.save()
            logger.info(f"Organization soft-deleted: {org_id}")
        return {"success": True, "message": "Organization soft-deleted successfully"}
    except ObjectDoesNotExist:
        raise OrganizationNotFoundError(org_id)
    except Exception as e:
        return handle_unexpected_error(e)

def get_all_organizations():
    try:
        organizations = Organization.objects.filter(deleted_at__isnull=True)
        logger.info("Retrieved all active organizations")
        serialized_data = OrganizationSerializer(organizations, many=True).data
        return {"success": True, "organizations": serialized_data}
    except Exception as e:
        return handle_unexpected_error(e)

def get_organization_by_id(org_id):
    try:
        organization = Organization.objects.get(id=org_id, deleted_at__isnull=True)
        logger.info(f"Retrieved organization: {org_id}")
        serialized_data = OrganizationSerializer(organization).data
        return {"success": True, "organization": serialized_data}
    except ObjectDoesNotExist:
        raise OrganizationNotFoundError(org_id)
    except Exception as e:
        return handle_unexpected_error(e)

# Developer Queries

def validate_organization(organization_id):
    try:
        return Organization.objects.get(id=organization_id, deleted_at__isnull=True)
    except ObjectDoesNotExist:
        raise OrganizationNotFoundError(organization_id)

def create_developer(organization_id, name):
    try:
        with transaction.atomic():
            validate_organization(organization_id)
            api_token = uuid.uuid4()
            developer = Developer.objects.create(
                organization_id=organization_id,
                name=name,
                api_token=api_token
            )
            logger.info(f"Developer created: {developer.id} in organization {organization_id}")
            serialized_data = DeveloperSerializer(developer).data
        return {"success": True, "developer": serialized_data}
    except ValidationError as e:
        return handle_validation_error(e)
    except Exception as e:
        return handle_unexpected_error(e)

def update_developer(dev_id, name):
    try:
        with transaction.atomic():
            developer = Developer.objects.get(id=dev_id, deleted_at__isnull=True)
            developer.name = name
            developer.save()
            logger.info(f"Developer updated: {developer.id}")
            serialized_data = DeveloperSerializer(developer).data
        return {"success": True, "developer": serialized_data}
    except ObjectDoesNotExist:
        raise DeveloperNotFoundError(dev_id)
    except ValidationError as e:
        return handle_validation_error(e)
    except Exception as e:
        return handle_unexpected_error(e)

def delete_developer(dev_id):
    try:
        with transaction.atomic():
            developer = Developer.objects.get(id=dev_id, deleted_at__isnull=True)
            developer.deleted_at = timezone.now()
            developer.save()
            logger.info(f"Developer soft-deleted: {dev_id}")
        return {"success": True, "message": "Developer soft-deleted successfully"}
    except ObjectDoesNotExist:
        raise DeveloperNotFoundError(dev_id)
    except Exception as e:
        return handle_unexpected_error(e)

def get_all_developers():
    try:
        developers = Developer.objects.filter(deleted_at__isnull=True)
        logger.info("Retrieved all active developers")
        serialized_data = DeveloperSerializer(developers, many=True).data
        return {"success": True, "developers": serialized_data}
    except Exception as e:
        return handle_unexpected_error(e)

def get_developer_by_id(dev_id):
    try:
        developer = Developer.objects.get(id=dev_id, deleted_at__isnull=True)
        logger.info(f"Retrieved developer: {dev_id}")
        serialized_data = DeveloperSerializer(developer).data
        return {"success": True, "developer": serialized_data}
    except ObjectDoesNotExist:
        raise DeveloperNotFoundError(dev_id)
    except Exception as e:
        return handle_unexpected_error(e)

def regenerate_api_token(dev_id):
    try:
        with transaction.atomic():
            developer = Developer.objects.get(id=dev_id, deleted_at__isnull=True)
            developer.api_token = uuid.uuid4()
            developer.save()
            logger.info(f"API token regenerated for developer: {developer.id}")
            serialized_data = DeveloperSerializer(developer).data
        return {"success": True, "developer": serialized_data}
    except ObjectDoesNotExist:
        raise DeveloperNotFoundError(dev_id)
    except Exception as e:
        return handle_unexpected_error(e)

def validate_api_token(dev_id, token):
    try:
        developer = Developer.objects.get(
            id=dev_id,
            api_token=token,
            deleted_at__isnull=True
        )
        logger.info(f"API token for developer {dev_id} is valid")
        return {"success": True, "developer": DeveloperSerializer(developer).data}
    except ObjectDoesNotExist:
        raise DeveloperNotFoundError(dev_id)
    except TokenExpiredError:
        return {"success": False, "message": "API token has expired"}
    except Exception as e:
        return handle_unexpected_error(e)