# error.py

import logging

# Configure logging
logger = logging.getLogger(__name__)

class CustomError(Exception):
    pass

class OrganizationNotFoundError(CustomError):
    def __init__(self, organization_id):
        self.message = f"Organization with id {organization_id} does not exist"
        super().__init__(self.message)
        logger.error(self.message)

class DeveloperNotFoundError(CustomError):
    def __init__(self, developer_id):
        self.message = f"Developer with id {developer_id} does not exist or is deleted"
        super().__init__(self.message)
        logger.error(self.message)

class TokenExpiredError(CustomError):
    def __init__(self, developer_id):
        self.message = f"API token for developer {developer_id} has expired"
        super().__init__(self.message)
        logger.error(self.message)

def handle_validation_error(e):
    logger.error(f"Validation error: {e}")
    return {"success": False, "message": str(e)}

def handle_unexpected_error(e):
    logger.error(f"Unexpected error: {e}", exc_info=True)  # Includes stack trace
    return {"success": False, "message": "Internal Server Error"}