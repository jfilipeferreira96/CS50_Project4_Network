from django.contrib.auth import authenticate, login, logout
from django.db import IntegrityError
from django.http import JsonResponse
from django.shortcuts import HttpResponse, HttpResponseRedirect, render
from django.shortcuts import render, redirect
from django.urls import reverse
from django.contrib.auth.decorators import login_required
import datetime
import json
from django.views.decorators.csrf import csrf_exempt
from django.core.paginator import Paginator, EmptyPage, PageNotAnInteger
from .models import User, Post, Follow, Like


def index(request):

    if request.user.is_authenticated:
        all_posts = Post.objects.all().order_by('-timestamp')
        #print(all_posts)
        user_liked_posts = Like.objects.filter(
            user_id=request.user.id).values_list('post_id', flat=True)
        post_num_like = {}

        if len(all_posts) > 0:
            for post in all_posts:
                post_num_like.update({post.id: Like.objects.filter(
            post=post.id).count()})
        
        paginator = Paginator(all_posts, 10)
        page_number = request.GET.get('page', 1)
        pages = paginator.get_page(page_number)
        
        return render(request, "network/index.html",{
            "user_liked_posts": user_liked_posts,
            "post_num_likes": post_num_like,
            "posts_pages": pages
        })
    else:
        return HttpResponseRedirect(reverse("login"))

@login_required(login_url="/login")
def new_post(request):
    if request.user.id is None:
        return HttpResponseRedirect(reverse("login"))
    else:
        if request.method == "POST":
            body = json.loads(request.body.decode('utf-8'))
            content = body['content']
            post = Post(user = User.objects.get(pk=request.user.id), content = content)
            post.save()
            return JsonResponse({"message": "Success"}, status=201)

    return HttpResponseRedirect(reverse("index"))

@login_required(login_url="/login")
@csrf_exempt
def like(request, post_id):
    
    #check if post is already liked!
    if request.method == "POST":
        liked_posts=Like.objects.filter(
            user_id=request.user.id).values_list('post_id', flat=True)
        
        if post_id not in liked_posts:
            #add like
            like = Like(user = User.objects.get(pk=request.user.id), post = Post.objects.get(pk=post_id))
            like.save()
            return JsonResponse({"message": "Success-add"}, status=201)
        else:
            #remove like
            like = Like.objects.filter(user = User.objects.get(pk=request.user.id), post = Post.objects.get(pk=post_id))
            like.delete()
            return JsonResponse({"message": "Success-remove"}, status=201)

    else:
        return JsonResponse({
            "error": "Something went wrong with the like"
        }, status=400)

def profile(request, username):
    is_following=False
    profile_user = User.objects.get(username__iexact=username) #iexact ignores the lower and upper cases
   
    posts = Post.objects.filter(
            user=profile_user.id).order_by('-timestamp')
    #print(posts)
    total_following = Follow.objects.filter(
        follower=profile_user).count()
    #print(total_following)
    total_followers = Follow.objects.filter(
        following=profile_user).count()
    #print(total_followers) 
    
    #is the logged_user following the current profile?
    if request.user.is_authenticated:
        logged_user = request.user.id
        if Follow.objects.filter(
        follower=request.user.id, following=profile_user).count() == 1:
            is_following=True
    
    #likes:
    user_liked_posts = Like.objects.filter(
            user_id=request.user.id).values_list('post_id', flat=True)
    post_num_like = {}
    if len(posts) > 0:
        for post in posts:
            post_num_like.update({post.id: Like.objects.filter(
        post=post.id).count()})

    #paginator:
    paginator = Paginator(posts, 10)
    page_number = request.GET.get('page', 1)
    pages = paginator.get_page(page_number)

    return render(request, "network/profile.html", {
        "posts_pages": pages,
        "profile_user": profile_user,
        "is_following": is_following,
        "total_following": total_following,
        "total_followers": total_followers,
        "self_user_id":request.user.id,
        "post_num_likes": post_num_like,
        "user_liked_posts": user_liked_posts

    })


def following(request):

    if request.user.is_authenticated:
        #displays every post of users that this user.id follows
        followers = Follow.objects.filter(follower=request.user.id)
        all_posts = Post.objects.filter(user_id__in=followers.values('following_id')).order_by(
            '-timestamp')
        user_liked_posts = Like.objects.filter(
            user_id=request.user.id).values_list('post_id', flat=True)
        post_num_like = {}


        if len(all_posts) > 0:
            for post in all_posts:
                post_num_like.update({post.id: Like.objects.filter(
            post=post.id).count()})

        paginator = Paginator(all_posts, 10)
        page_number = request.GET.get('page', 1)
        pages = paginator.get_page(page_number)
        return render(request, "network/following.html",{
            "posts_pages": pages,
            "user_liked_posts": user_liked_posts,
            "post_num_likes": post_num_like
        })
    else:
        return HttpResponseRedirect(reverse("login"))

@login_required(login_url="/login")
@csrf_exempt
def edit(request,post_id):
    if request.method == "PUT":
        body = json.loads(request.body.decode('utf-8'))
        #get the post
        post_to_edit = Post.objects.get(pk=post_id)
        post_to_edit.content = body['content']
        post_to_edit.save()

        return JsonResponse({"message": "Success"}, status=201)
    else:
        return JsonResponse({"message": "Error"}, status=400)


@login_required(login_url="/login")
@csrf_exempt
def follow(request, user_id):
    if request.method == "POST":
        query = Follow.objects.filter(
        follower=request.user.id, following=user_id)
        print(query)
        if query.count() == 1:
            print('entrei1')
            #user is following, then we have to remove the follow in the db
            unfollow = query
            unfollow.delete()
            return JsonResponse({"message": "Success unfollow"}, status=201)
        else:
            print('entrei2')
            #user is not following, then we have to add the follow in the db
            follow = Follow(follower= User.objects.get(pk=request.user.id), following = User.objects.get(pk=user_id))
            follow.save()
            return JsonResponse({"message": "Success follow"}, status=201)

def login_view(request):
    if request.method == "POST":

        # Attempt to sign user in
        username = request.POST["username"]
        password = request.POST["password"]
        user = authenticate(request, username=username, password=password)

        # Check if authentication successful
        if user is not None:
            login(request, user)
            return HttpResponseRedirect(reverse("index"))
        else:
            return render(request, "network/login.html", {
                "message": "Invalid username and/or password."
            })
    else:
        return render(request, "network/login.html")


def logout_view(request):
    logout(request)
    return HttpResponseRedirect(reverse("login"))


def register(request):
    if request.method == "POST":
        username = request.POST["username"]
        email = request.POST["email"]

        # Ensure password matches confirmation
        password = request.POST["password"]
        confirmation = request.POST["confirmation"]
        if password != confirmation:
            return render(request, "network/register.html", {
                "message": "Passwords must match."
            })

        # Attempt to create new user
        try:
            user = User.objects.create_user(username, email, password)
            user.save()
        except IntegrityError:
            return render(request, "network/register.html", {
                "message": "Username already taken."
            })
        login(request, user)
        return HttpResponseRedirect(reverse("index"))
    else:
        return render(request, "network/register.html")
