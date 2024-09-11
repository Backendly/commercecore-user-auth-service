from django.test import TestCase

# tests.py

from django.test import TestCase, Client
from django.urls import reverse
from rest_framework import status
from .models import Organization, Developer

class APITests(TestCase):
    def setUp(self):
        self.client = Client()
        self.organization = Organization.objects.create(name="Test Organization")
        self.developer = Developer.objects.create(organization=self.organization, name="Test Developer")
        self.token = '8f7364bc-5c2f-4b27-99f1-dfb819a83563'

    def test_create_organization(self):
        url = reverse('create_organization_view')
        data = {'name': 'New Organization'}
        response = self.client.post(url, data, HTTP_AUTHORIZATION=f'Token {self.token}')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

    def test_update_organization(self):
        url = reverse('update_organization_view', args=[self.organization.id])
        data = {'name': 'Updated Organization'}
        response = self.client.put(url, data, content_type='application/json', HTTP_AUTHORIZATION=f'Token {self.token}')
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_delete_organization(self):
        url = reverse('delete_organization_view', args=[self.organization.id])
        response = self.client.delete(url, HTTP_AUTHORIZATION=f'Token {self.token}')
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_get_all_organizations(self):
        url = reverse('get_all_organizations_view')
        response = self.client.get(url, HTTP_AUTHORIZATION=f'Token {self.token}')
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_get_organization_by_id(self):
        url = reverse('get_organization_by_id_view', args=[self.organization.id])
        response = self.client.get(url, HTTP_AUTHORIZATION=f'Token {self.token}')
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_create_developer(self):
        url = reverse('create_developer_view')
        data = {'organization_id': self.organization.id, 'name': 'New Developer'}
        response = self.client.post(url, data, HTTP_AUTHORIZATION=f'Token {self.token}')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

    def test_update_developer(self):
        url = reverse('update_developer_view', args=[self.developer.id])
        data = {'name': 'Updated Developer'}
        response = self.client.put(url, data, content_type='application/json', HTTP_AUTHORIZATION=f'Token {self.token}')
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_delete_developer(self):
        url = reverse('delete_developer_view', args=[self.developer.id])
        response = self.client.delete(url, HTTP_AUTHORIZATION=f'Token {self.token}')
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_get_all_developers(self):
        url = reverse('get_all_developers_view')
        response = self.client.get(url, HTTP_AUTHORIZATION=f'Token {self.token}')
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_get_developer_by_id(self):
        url = reverse('get_developer_by_id_view', args=[self.developer.id])
        response = self.client.get(url, HTTP_AUTHORIZATION=f'Token {self.token}')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
