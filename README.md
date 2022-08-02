# Ticketing

Ticket marketplace built with NodeJS / Typescript and React, containerized and deployed with Docker and Kubernetes. This project was built using a microservices architecture.

## Requirements

- [NodeJS](https://nodejs.org/en/download/)
- [Typescript](https://www.typescriptlang.org/download)
- [Skaffold](https://skaffold.dev/docs/install/)
- [Docker](https://docs.docker.com/desktop/)
- [Kubernetes](https://kubernetes.io/docs/setup/production-environment/tools/kubeadm/install-kubeadm/)

## Quick Start

1. Create your JWT_KEY env variable to sign tokens:
```$ kubectl create secret generic jwt-secret --from-literal=JWT_KEY=<your-jwt-secret-key>```

2. Create your STRIPE_KEY using your own Stripe Dev secret key:
```kubectl create secret generic stripe-secret --from-literal=STRIPE_KEY=<your-stripe-secret-key>```

3. Execute the following command in the project root folder:
```skaffold dev```
This will build and deploy the application to your local cluster, and watch for changes in real time.

## About

This project was built using a microservices architecture. Each service communicates to each other using async communication, facilitated by NATS Streaming Server. There was strong focus on robust data replication, and optimistic concurrency control. 

The individual services, their business logic, and the messages they emit/receive are:

#### Auth 
  - To authorize and authenticate users
  - Events:
    - Received:
        None
    - Published:
        None 

#### Tickets
  - To list, and give authorized users ability to buy and sell tickets
  - Events:
    - Received:
        - OrderCreated
        - OrderCancelled
    - Published: 
        - TicketCreated
        - TicketUpdated

#### Orders
  - To reserve/unreserve tickets for purchasing so that other users do not try to purchase the same ticket
  - Events:
    - Received:
        - ExpirationComplete
        - PaymentComplete
        - TicketCreated
        - TicketUpdated
    - Published:
        - OrderCreated
        - OrderCancelled

#### Expiration
  - Sets an expiration timer per order (Default: 60 seconds), after which a user can no longer purchase a ticket
  - Events:
    - Received:
        - OrderCreated
    - Published: 
        - ExpirationComplete

#### Payments
  - Handles payment for an order
  - Events: 
    - Received:
      - OrderCreated
      - OrderCancelled
    - Published: 
      - PaymentCreated

## Conclusions

This was a great introductory project to system design, and primarily built as a learning experience. I learned about / practiced with
  - Dockerizing services and deploying them to a locally hosted cluster
  - Routing to / from and within a kubernetes cluster
  - Creating and testing APIs
  - Robust microservices design and theory
  - Publishing and receiving concurrent messages
  - Optimistic Concurrency Control
  - Using a statically typed language (TypeScript)