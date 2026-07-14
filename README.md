# Ripple — Cloud-Native Microservices Social Content Platform

A Twitter/Instagram-style social platform built as microservices.

## Folder Structure

```
ripple/
├── api-gateway/
│   └── src/{middleware,routes,config}/
├── auth-service/
│   └── src/{controllers,routes,models,services,kafka,config}/
├── user-service/
│   └── src/{controllers,routes,models,kafka,config}/
├── post-service/
│   └── src/{controllers,routes,models,kafka,config}/
├── feed-service/
│   └── src/{controllers,routes,kafka,redis,clients}/
├── notification-service/
│   └── src/{controllers,routes,kafka,websocket}/
├── media-service/
│   └── src/{controllers,routes,storage}/
├── frontend/
│   └── src/{components,pages,hooks,api}/
├── k8s/
│   └── {deployments,services,configmaps,secrets,hpa}/
├── .github/workflows/
├── docs/{openapi,er-diagrams}/
└── docker-compose.yml
```
