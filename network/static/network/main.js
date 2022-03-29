//this js will run in the index and followers page
if (document.getElementById('index_page') != null || document.getElementById('followers_page') != null) {

    const content = document.getElementById('content');
    const btn_post = document.getElementById('btn_submit');
    const form = document.querySelector('form');

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        
        post(form.getAttribute('data-id'), content.value, e.target[0].value, form.getAttribute('data-user'));
    });

    
    const post = async (user_id, content, csrftoken, username) => {
        
        try {
            const response = await fetch('/new_post', {
                method: 'POST',
                headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                "X-CSRFToken": csrftoken
                },
                body: JSON.stringify({
                    "content": content
                })
            });
            const data = await response.json();
            content.value = ``;
            console.log(data);
            let html = ``;
            if (data.message == 'Success') {
                //load new post
                html =
                    `
                    <hr style="margin-bottom: 0px;">
                    <li class="timeline-item" id="post_16">
                        <div class="card card-white card-no-padding">
                            <div class="card-body">
                                <div class="timeline-item-header">
                                    <img src="/static/network/img/user-${username}.png">
                                    <p><a class="a_user" href="/u/${username}">${username} </a><span>posted on</span></p>
                                    <small>Now</small>
                                </div>
                                <div class="timeline-item-post">
                                    <p>${content}</p>
                                    <div class="timeline-options">
                                        <a href="" onclick="like(16)" class=""><i class="fa fa-thumbs-up"></i> Like</a>
                                        <a href=""><i class="fa fa-comment"></i> Comment</a>
                                        <a href=""><i class="fa fa-share"></i> Share</a>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </li>`;
                
                document.querySelector('.list-unstyled').insertAdjacentHTML('afterbegin' , html);
            }

        }catch(error) {
            console.log(error)
        } 
    }
 

    document.querySelectorAll('.like_btn').forEach((btn) => {
        btn.addEventListener('click', (e) => {
            console.log(btn.id);
            //calling of the async function that will remove or add the like on the db
            like_async(btn.id);
        })
    })
    

    const like_async = async (post_id) => {
        
        try {
            const response = await fetch(`/like/${post_id}`, {
                method: 'POST',
                headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
                },
                body: JSON.stringify({})
            });
            const data = await response.json();
            
            console.log(data);
            let like = document.getElementById(`likes_${post_id}`);
            let num_of_likes = Number(like.textContent.charAt(1));
           
            if (data.message == 'Success-add') {
                num_of_likes++;
                like.innerHTML = `(${num_of_likes})`;
                document.getElementById(post_id).classList.add('active');
            }
            if (data.message == 'Success-remove') {
                num_of_likes--;
                like.innerHTML = `(${num_of_likes})`;
                document.getElementById(post_id).classList.remove('active');
            }

        }catch(error) {
            console.log(error)
        } 
    }


    document.querySelectorAll('.edit_btn').forEach((btn) => {
        btn.addEventListener('click', (e) => {
        
            let post_id = btn.getAttribute('data-id');
            let post_content = document.querySelector(`#post_${post_id} .timeline-item-post p`);
            post_content.classList.add('d-none');

            //creating an element - textarea which contains the information about the post
            let textarea = document.createElement("textarea");
            textarea.cols = 1;
            textarea.rows = 3;
            textarea.className = 'form-control mb-2';
            textarea.textContent = `${post_content.textContent}`;
            //creating the cancel and confirm buttons 
            let btn_div = `
            <div class="mb-2 text-end">
                <a class="confirm-class" id="confirm_${post_id}" onclick="confirm(${post_id})"><i class="fa fa-check"></i></a>
                <a class="cancel-class" id="confirm_${post_id}" onclick="cancel(${post_id})"><i class="fa fa-times"></i></a>
            </div>`;
            //insert the textare after the hiding post_content with some buttons.
            post_content.insertAdjacentElement('afterend', textarea)
            textarea.insertAdjacentHTML('afterend', btn_div)
        })
    })

    //functions of the cancel and confirm button
    function confirm(id) {
        //calls the async function with the new text area
        //updates the <p> tag after everythings is sucessfull
        edit_post(id);

    }

    function cancel(id) {
        //removes the <p> that was displaying none
        document.querySelector(`#post_${id} .timeline-item-post p`).classList.remove('d-none');
        //destroys the textarea and the buttons that we have created 
        document.querySelector(`#post_${id} .timeline-item-post textarea`).remove();
        document.querySelector(`#post_${id} .timeline-item-post div.text-end`).remove();
    }

    const edit_post = async (post_id) => {
        
        try {
            const response = await fetch(`/edit/${post_id}`, {
                method: 'PUT',
                headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    "content": document.querySelector(`#post_${post_id} .timeline-item-post textarea`).value
                })
            });
            const data = await response.json();
            
            console.log(data);
           
            if (data.message == 'Success') {
                //the previous <p> assumes the value of the textare
                document.querySelector(`#post_${post_id} .timeline-item-post p`).textContent = `${document.querySelector(`#post_${post_id} .timeline-item-post textarea`).value}`;
                //finnally we destroy the textarea and the buttons that we have created 
                document.querySelector(`#post_${post_id} .timeline-item-post textarea`).remove();
                document.querySelector(`#post_${post_id} .timeline-item-post div.text-end`).remove();
                //removes the <p> that was displaying none
                document.querySelector(`#post_${post_id} .timeline-item-post p`).classList.remove('d-none');
            }
            
            //i could implement error handling if something went wrong while updating the post...

        }catch(error) {
            console.log(error)
        } 
    }

}

//this code will run in the profile page:
if (document.getElementById('profile_page') != null) {
    
    //Likes functions
        document.querySelectorAll('.like_btn').forEach((btn) => {
        btn.addEventListener('click', (e) => {
            console.log(btn.id);
            //calling of the async function that will remove or add the like on the db
            like_async(btn.id);
        })
    })
    

    const like_async = async (post_id) => {
        
        try {
            const response = await fetch(`/like/${post_id}`, {
                method: 'POST',
                headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
                },
                body: JSON.stringify({})
            });
            const data = await response.json();
            
            console.log(data);
            let like = document.getElementById(`likes_${post_id}`);
            let num_of_likes = Number(like.textContent.charAt(1));
           
            if (data.message == 'Success-add') {
                num_of_likes++;
                like.innerHTML = `(${num_of_likes})`;
                document.getElementById(post_id).classList.add('active');
            }
            if (data.message == 'Success-remove') {
                num_of_likes--;
                like.innerHTML = `(${num_of_likes})`;
                document.getElementById(post_id).classList.remove('active');
            }

        }catch(error) {
            console.log(error)
        } 
    }

    //Following functions
    function follow_unfollow(user_id) {
        async_following(user_id);
    }

    const async_following = async (user_id) => {
        
        try {
            const response = await fetch(`/follow/${user_id}`, {
                method: 'POST',
                headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
                },
                body: JSON.stringify({})
            });
            const data = await response.json();
            let total_followers = document.getElementById('total_followers');
            let num_total_followers = Number(total_followers.textContent);
            
            if (data.message == 'Success follow') {
                num_total_followers++;
                total_followers.innerHTML = num_total_followers;
                document.getElementById('follow').classList.add('d-none');
                document.getElementById('unfollow').classList.remove('d-none');
            }
            if (data.message == 'Success unfollow') {
                num_total_followers--;
                total_followers.innerHTML = num_total_followers;
                document.getElementById('follow').classList.remove('d-none');
                document.getElementById('unfollow').classList.add('d-none');
            }
            
        }catch(error) {
            console.log(error)
        } 
    }

    document.querySelectorAll('.edit_btn').forEach((btn) => {
        btn.addEventListener('click', (e) => {
        
            let post_id = btn.getAttribute('data-id');
            let post_content = document.querySelector(`#post_${post_id} .timeline-item-post p`);
            post_content.classList.add('d-none');

            //creating an element - textarea which contains the information about the post
            let textarea = document.createElement("textarea");
            textarea.cols = 1;
            textarea.rows = 3;
            textarea.className = 'form-control mb-2';
            textarea.textContent = `${post_content.textContent}`;
            //creating the cancel and confirm buttons 
            let btn_div = `
            <div class="mb-2 text-end">
                <a class="confirm-class" id="confirm_${post_id}" onclick="confirm(${post_id})"><i class="fa fa-check"></i></a>
                <a class="cancel-class" id="confirm_${post_id}" onclick="cancel(${post_id})"><i class="fa fa-times"></i></a>
            </div>`;
            //insert the textare after the hiding post_content with some buttons.
            post_content.insertAdjacentElement('afterend', textarea)
            textarea.insertAdjacentHTML('afterend', btn_div)
        })
    })

    //functions of the cancel and confirm button
    function confirm(id) {
        //calls the async function with the new text area
        //updates the <p> tag after everythings is sucessfull
        edit_post(id);

    }

    function cancel(id) {
        //removes the <p> that was displaying none
        document.querySelector(`#post_${id} .timeline-item-post p`).classList.remove('d-none');
        //destroys the textarea and the buttons that we have created 
        document.querySelector(`#post_${id} .timeline-item-post textarea`).remove();
        document.querySelector(`#post_${id} .timeline-item-post div.text-end`).remove();
    }

    const edit_post = async (post_id) => {
        
        try {
            const response = await fetch(`/edit/${post_id}`, {
                method: 'PUT',
                headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    "content": document.querySelector(`#post_${post_id} .timeline-item-post textarea`).value
                })
            });
            const data = await response.json();
            
            console.log(data);
           
            if (data.message == 'Success') {
                //the previous <p> assumes the value of the textare
                document.querySelector(`#post_${post_id} .timeline-item-post p`).textContent = `${document.querySelector(`#post_${post_id} .timeline-item-post textarea`).value}`;
                //finnally we destroy the textarea and the buttons that we have created 
                document.querySelector(`#post_${post_id} .timeline-item-post textarea`).remove();
                document.querySelector(`#post_${post_id} .timeline-item-post div.text-end`).remove();
                //removes the <p> that was displaying none
                document.querySelector(`#post_${post_id} .timeline-item-post p`).classList.remove('d-none');
            }

            //i could implement error handling if something went wrong while updating the post...

        }catch(error) {
            console.log(error)
        } 
    }

}