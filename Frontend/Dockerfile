# שלב 1: Build לפרונטאנד
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# שלב 2: הגשת הקבצים בעזרת Nginx
FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
# העתקת קובץ ההגדרות המותאם שלנו ל-Nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]