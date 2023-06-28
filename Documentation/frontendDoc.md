# **Documentation Frontend**

## **Content**
- Architecture Overview
- AWS Amplify
- Amazon Cognito
- Amazon API Gateway
- Other used services

</br>

## **Architecture Overview Frontend**
This architecture diagram shows the connections between the web browser and the used AWS services
- AWS Amplify
- Amazon Cognito
- Amazon API Gateway

    <img src="./Images/architectureDiagramFrontend.png" title="Screenshot" width="400"/></br></br>


## **AWS Amplify: Hosting the websites**
HTML files to sign-in, book rooms and see the occupancy of the rooms. The sites are showing textfields, buttons, links, tables and graphs.

- Sign in or register

    <img src="./Images/registerOrSignin.png" title="Screenshot" width="500"/>

- Register

    <img src="./Images/register.png" title="Screenshot" width="500"/>

- Verify

    <img src="./Images/verify.png" title="Screenshot" width="500"/>

- Sign In

    <img src="./Images/signin.png" title="Screenshot" width="500"/>

- Forgot Password

    <img src="./Images/forgotPassword.png" title="Screenshot" width="500"/>

- Reset Password

    <img src="./Images/resetPassword.png" title="Screenshot" width="500"/>

- Room Booking

    <img src="./Images/booking.png" title="Screenshot" width="500"/>

- Room Occupancy

    <img src="./Images/occupancy.png" title="Screenshot" width="500"/>

</br>

## **Cognito: User verification, access management**
Cognito manages the user verification.
After a registration request, the requester gets an email with a verification code. Only with this code and the provided email a complete registration is possible. The successfully following sign-in process leads to the booking page. Only if a valid token is send to the backend the booking of a room is possible.

API calls against Cognito:
- GET: retrieve the authorization token
- POST: user registration with email and password, verificationcode

</br>

## **Amazon API Gateway**
- API calls against the booking system:
    - GET: retrieve of booking information and sending authorization token in the header
    - POST: send the booking data: room ID, booking date, start- and end-time of the booking and the authorization token in the header
    - DELETE: send the unique booking code, room, date and authorization token in the header

- API calls against the occupancy system:
    - GET: retrieve real time sensor data

</br>

## **Other services or tools**
- For coding: Text Editor Visual Studio Code
- Versioning tool: Git
- Collaborative work: GitHub for the project to share it
- ToDo Board on GitHub
- Canvas chart to display the occupancy graph
- AWS SDK
- HTML for the web sites
- CSS for styling the web sites
- Bootstrap to make web sites responsive
- JavaScript for coding the script
