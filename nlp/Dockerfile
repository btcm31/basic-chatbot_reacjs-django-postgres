FROM python:3.8
WORKDIR /app/nlp
COPY requirements.txt /app/nlp/
RUN pip install -r requirements.txt

#EXPOSE 22 8888
CMD ["python", "pytorch.py"]