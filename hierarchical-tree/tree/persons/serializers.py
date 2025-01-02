from rest_framework import serializers
from .models import Person

class PersonSerializer(serializers.ModelSerializer):
    children = serializers.SerializerMethodField()

    class Meta:
        model = Person
        fields = ['id', 'name', 'parent', 'children']

    def get_children(self, obj):
        return PersonSerializer(obj.children.all(), many=True).data
