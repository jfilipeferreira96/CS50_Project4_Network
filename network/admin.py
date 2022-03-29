from django.contrib import admin
from .models import User, Post, Like, Follow
# Register your models here.

class UserAdmin(admin.ModelAdmin):
    list_display = ("id", "username", "email", "password")

class PostAdmin(admin.ModelAdmin):
    list_display = ("id", "user", "content", "timestamp")

class LikeAdmin(admin.ModelAdmin):
    list_display = ("id", "user", "post")

class FollowAdmin(admin.ModelAdmin):
    list_display = ("id", "follower", "following")

admin.site.register(User, UserAdmin)
admin.site.register(Post, PostAdmin)
admin.site.register(Like, LikeAdmin)
admin.site.register(Follow, FollowAdmin)
