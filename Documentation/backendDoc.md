# Process

  ## 1) Cloud settings - region, budget

    - we defined the resource budget - AWS Console > Billing Dasboard > Budget
    - we defined the region for implementation as per customer's request - Region > Frankfurt

  ## 2) AWS component definition
  
    - as per customer's request, we selected the following AWS components: Lambda, SES, DynamoDB, IAM, S3, API Gateway

    Lambda - an event-driven serverless computing platform
    Simple Email Service (SES) - email platform enbaling sending and receiving of emails in HTML format
    DynamoDB - fully managed NoSQL database offering autoscalling and encryption At Rest features
    Identitiy and Access Management (IAM) - central management platform for AWS resource user access
    S3 - simple storage service
    API Gateway - fully managed services for API management 

  ## 3) IAM role definition


    In order to establish the connection between Lambda and other AWS components, the following IAM roles were defined:

    A) TRM_postRoomBooking-role-z1i9g8w9
        - permissions: AWSLambdaBasicExecutionRole-2741c49f-eb05-4f23-8fbb-a56fe62f5cee, SESFullAccess, DynamoDB-Putitem
        
    B) TRM_deleteBooking-role-z0itjt76
        - permissions: AWSLambdaBasicExecutionRole-8653ab0f-9a33-4848-b058-b926101e04c0, DynamoDB_Delete-Update_Item, 
          SESFullAccess
        
    C) TRM_getRoomVacancy
        - permissions: AWSLambdaBasicExecutionRole-02040bd4-28c8-4a34-8676-d0c80f0ca52c, 
          AWSLambdaSNSTopicDestinationExecutionRole-d1d0e6aa-7f49-4fa8-b7b7-1554989d1c27, TRM_Lambda_Get_Data

    D) TRM_getOccupancy
      - permissions: AWSLambdaBasicExecutionRole-1adafbce-f18f-41b4-a9ce-615088a6f0c2, 
        AWSLambdaS3ExecutionRole-092957d3-3dba-44fc-b032-8d5e1dab817d, AWSConfigRulesExecutionRole

   ## 4) APIs definition


    A) TRM_RoomBooking_API - Rest API, connects frontend with the room booking Lambda functions
    B) Methods: Post, Delete, Get
    C) Authorizers: TRM-api-authorizer - after verification in Cognito, the authotizer checks the User ID authentification 
       and then calls the API 
    D) Invoke URL: https://tgjdqpmdj0.execute-api.eu-central-1.amazonaws.com/Dev/ - connects with frontend to check the Token 
       for authentification

| Resource | Method | Endpoint |Request parameter | Description | Response Body 1 | Response Body 2 | Response Body 3 | Response Body 4 | Response Body 5 |
| -------- | -------- | -------- | ----------- | ----------- | --------------- | --------------- | --------------- | --------------- | --------------- |
| deletebooking | POST   | /Dev/' | '"body": {"meetingroomID": "", "booking_date": "", "start_time": "", "end_time": ""}'| Request to delete booking | Response {"statusCode": 400, "headers": { "Access-Control-Allow-Headers": "*", "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Methods": "*" }, "body": "\"Booking not found.\"" } | Response {"statusCode": 200, "headers": { "Access-Control-Allow-Headers": "*", "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Methods": "*" }, "body": "\"Booking has been deleted and email sent.\"" } | Response {"statusCode": 500, "headers": { "Access-Control-Allow-Headers": "*", "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Methods": "*" }, "body": "\"Error.\"" } |
| getoccupancy| GET  | /Dev/' | | Request to retrieve booking data | Response { "statusCode": "200", "headers": { "Access-Control-Allow-Headers": "*", "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Methods": "*" }, "body": "\"{\\n  \\\"2\\\": [\\n   {\\n      \\\"start_time\\\": \\\"19:47\\\",\\n      \\\"end_time\\\": \\\"20:47\\\"\\n    }\\n  ]\\n}\"" }
|| POST  | /Dev/' || Request to post new booking | Response {"statusCode": 200, "headers": { "Access-Control-Allow-Headers": "*", "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Methods": "*" }, "body": "\"New booking made and email sent.\"" } | Response {"statusCode": 400, "headers": { "Access-Control-Allow-Headers": "*", "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Methods": "*" }, "body": "\"data failed to post\"" } | Response {"statusCode": 500, "headers": { "Access-Control-Allow-Headers": "*", "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Methods": "*" }, "body": "\"Error.\"" } | Response {"statusCode": 400, "headers": { "Access-Control-Allow-Headers": "*", "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Methods": "*" }, "body": "\"This booking clashes with existing booking.\"" } | Response {"statusCode": 400, "headers": { "Access-Control-Allow-Headers": "*", "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Methods": "*" }, "body": "\"Unable to create booking, please check booking details.\"" } |

  
   ## 5) Lambda Function definition


     A) TRM_postRoomBooking - when triggered, the function posts booking details into DynamoDB and sends an email notifaction 
        through SES to an end user

     B) TRM_deleteBooking - when triggered, the function deletes booking details in DynamoDb and send an email notification 
        through SES to an end user

     C) TRM_getVacancy - when triggered, the function retrieves data from DynamoDB and sends it to frontend in order to 
        display conference room vacancies

     D) TRM_getOccupancy - when triggered, the function retrieves data from S3 Bucket und sends it to the frontend in order 
        to display the room occupancy
   

  ## 6) DynamoDB table definition


     A) TRM_MeetingRoom_Booking - the table stores booking information such as the booking code, booking date, start time, 
        end time, meeting room, employee ID 

      - Partition Key: booking_code
      - Sort Key: booking_date

  ## 7) Notification workflow using SES
  

    A) All functionalities are enabled through Lambda functions
    B) Users receive email notifications when completing the action of creating, updating and deleting their bookings 
    
 
# Architecture

  ## Architecture Diagram

  <img src="./Images/ArchitectureDiagram.PNG" title="Architecture Diagram" width="1000"/>

  ## Data Flow


    1. Create a room booking

    The API Gateway calls the Lambda Function TRM_postRoomBooking after authenticating the user against the session. 
    The data is processed and the function checks the database for existing bookings, if existing booking is found, 
    the post request is rejected and if not, the booking is made and data is stored in the DynamoDB. 
    The user gets an email notification with the booking information.
    
    2. Deleting a room booking

    The API Gateway calls the Lambda Function TRM_deleteBooking. The data is checked to make sure the signed in user 
    is the owner of the booking, If the user is confirmed as the owner then the booking is deleted and the stored data 
    is deleted from the Database and the user gets an email notification with the booking cancelation.

    3. Retrieve room vaccancy

    The API Gateway calls the Lambda Function TRM_getVacancy. All booking with a specified date is retrieved from the 
    Database and sent as a response.

    4. Retrieve room occupancy

    The API Gateway calls the Lambda Function TRM_getOccupancy. The function retrieves the stored sensor data reading from 
    the S3 bucket, processes the data into an array ready for plotting and returns it in a response.
