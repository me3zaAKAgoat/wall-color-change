cd frontend
npm i && npm run build
rm -rf ../backend/build
mv ./dist ../backend/build/
cd ../backend
python3 -m venv ./.venv
source ./.venv/bin/activate
pip3 install -r requirements.txt
gunicorn -w 4 -b 0.0.0.0:8000 app:app