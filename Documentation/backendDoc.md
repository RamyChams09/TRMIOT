Process

  1) Cloud settings - region, budget

    - we defined the resource budget - AWS Console > Billing Dasboard > Budget
    - we defined the region for implementation as per customer's request - Region > Frankfurt

  2) AWS component definition
  
    - as per customer's request, we selected the following AWS components: Lambda, SES, DynamoDB, IAM, S3, API Gateway

    Lambda - an event-driven serverless computing platform
    Simple Email Service (SES) - emnail platform enbaling sending and receiving of emails in HTML format
    DynamoDB - fully managed NoSQL database offering autoscalling and encryption At Rest features
    Identitiy and Access Management (IAM) - central management platform for AWS resource user access
    S3 - simple storage service
    API Gateway - fully managed services for API management 

  3) IAM role definition

    IAM > Roles > Create Role

    In order to establish the connection between Lambda and other AWS components, the following IAM roles were defined:

    A) TRM_postRoomBooking-role-z1i9g8w9
        - permissions: AWSLambdaBasicExecutionRole-2741c49f-eb05-4f23-8fbb-a56fe62f5cee, SESFullAccess, DynamoDB-Putitem
        
    B) TRM_deleteBooking-role-z0itjt76
        - AWSLambdaBasicExecutionRole-8653ab0f-9a33-4848-b058-b926101e04c0, DynamoDB_Delete-Update_Item, SESFullAccess
        
    C) TRM_getRoomVacancy
        - AWSLambdaBasicExecutionRole-02040bd4-28c8-4a34-8676-d0c80f0ca52c, AWSLambdaSNSTopicDestinationExecutionRole-d1d0e6aa-7f49-4fa8-b7b7-1554989d1c27, TRM_Lambda_Get_Data

   4) APIs definition

    API Gateway > Create API

    A) TRM_RoomBooking_API - Rest API, connects frontend with the room booking Lambda functions
    B)
  
   5) Lambda Function definition

    Lambda > create functiona

     A) TRM_postRoomBooking - when triggered, the function posts booking details into DynamoDB and sends an email notifaction through SES to an end user

     B) TRM_deleteBooking - when triggered, the function deletes booking details in DynamoDb and send an email notification through SES to an end user

     C) TRM_getRoomVacancy - when triggered, the function retrieves data from DynamoDB and sends it to frotend in order to display conference room vacancies
   
     D) TRM_UpdateBooking - when triggered, the function will update the booking details in DynamonDB and send an email notification through SES to an end user

  6) DynamoDB table definition

    DynamoDB > create table

     A) TRM_MeetingRoom_Booking - the table stores booking information such as the booking code, date, time, employee ID and the meeting room name
      - Partition Key: booking_code

     B) UserList - the table stores the user information such as user names and email addresses
      - Partition Key: User Name
    
     C) Sensors - to be continued


  7) Notification workflow using SES
  
    SES > Email verification

    All functionalities are enabled through Lambda functions.
 
 
Data Flow

    - add the flow diagram and describe it
