# Secrets App

"Secrets" is an app made to practice authentication and verification. it allows users to register by using an email and password of their choosing which then gets hashed and salted using passport and saved to a mongo database. Another method for registering to this app is by using a google account through the Oauth google strategy which saves a user ID to the same database. Once a user has registered a cookie is created to keep track of the user session, once the user logs out (or the application is closed) this cookie gets deleted and a different user may log in.

This app is a simplified version of the "Whispers" app which allows users to anonymously make posts, in the "Secrets" app each user can submit their secret anonymously which can be viewed by all users that log into their account and go to the "Secrets" page.

![image](https://user-images.githubusercontent.com/59423827/178127675-c9fabfd0-a450-4d34-aa4a-3da7b66ceadf.png)

![image](https://user-images.githubusercontent.com/59423827/178127680-8d0e0473-8e3d-415c-b453-9eef6d6e019d.png)

![image](https://user-images.githubusercontent.com/59423827/178127681-c76b327a-4572-49c0-801e-b3592bff7319.png)

![image](https://user-images.githubusercontent.com/59423827/178127697-ea9432b0-239d-44c5-9d34-43427572dfb6.png)
