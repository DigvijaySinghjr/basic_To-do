# Basic To-Do App

A simple to-do list application built with Node.js, Express, and MongoDB.

## Features
- Create, edit, and delete notes and to-dos
- Support for photos and simple formatting
- Collaboration enabled (share lists with others)












Authentication

how session works in logging
-> so we need connect-mongo, that'll help us to store the session in db.
-> and how to store like format , we need session-express
-> 


now doing Authorization
-> role based policies.(owner can transfer ownership, revoke access)
->  having 4 roles to maximize granular control.
-> 

| Role   | Permissions to Implement                                        | Learning Focus                                                                                             |
|--------|-----------------------------------------------------------------|------------------------------------------------------------------------------------------------------------|
| Viewer | `read:self`, `read:group`                                       | Basic GET request check.                                                                                   |
| User   | `create:note`, `update:own_note`, `delete:own_note`             | **Ownership Check:** Requires checking if `req.user.id` matches the note's `authorId`.                     |
| Editor | `update:any_note`, `delete:any_note`, `manage:group_settings`   | **Group Scope Check:** Requires checking if the user is a member of the group and has the Editor role for that specific group. |
| Admin  | `manage:roles`, `manage:users`                                  | **Global/System Check:** Requires checking if the user is the owner/admin of the entire collaboration space. |