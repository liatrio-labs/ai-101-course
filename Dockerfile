FROM python:3.13-slim

WORKDIR /srv

COPY ai-101-course.html index.html
COPY course-state.js support.js logo_Liatrio_reverse-color.png ./
COPY _ds ./_ds

EXPOSE 8080

CMD ["sh", "-c", "python -m http.server ${PORT:-8080} --bind 0.0.0.0 --directory /srv"]
