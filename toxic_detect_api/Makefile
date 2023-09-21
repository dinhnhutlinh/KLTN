run:
	python3 manage.py runserver

migrate:
	python3 manage.py makemigrations
	python3 manage.py migrate

runall:
	python3 manage.py runserver 0.0.0.0:8000 | ./ngrok http --domain=foxhound-intimate-oriole.ngrok-free.app 8000