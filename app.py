from flask import Flask, render_template, request
from flask_socketio import SocketIO, emit, join_room
import random
import string

app = Flask(__name__)
app.config['SECRET_KEY'] = 'secret!'
socketio = SocketIO(app, cors_allowed_origins="*")

rooms = {}


def gen_code():
    return ''.join(random.choices(string.ascii_uppercase + string.digits, k=6))


@app.route('/')
def index():
    return render_template('index.html')


@app.route('/room')
def room():
    code = request.args.get('code', '')
    return render_template('room.html', code=code)


@socketio.on('create_room')
def handle_create_room():
    code = gen_code()
    while code in rooms:
        code = gen_code()
    rooms[code] = {"movie": None, "messages": []}
    emit('room_created', {'code': code})


@socketio.on('join')
def handle_join(data):
    code = data.get('code', '').upper()
    name = data.get('name', 'Гость')

    if code not in rooms:
        emit('join_error', {'message': 'Комната не найдена'})
        return

    join_room(code)
    emit('joined', {'code': code})
    emit('movie_update', rooms[code]['movie'])
    emit('messages_history', rooms[code]['messages'])
    emit('user_joined', {'name': name}, to=code, include_self=False)


@socketio.on('select_movie')
def handle_select_movie(data):
    code = data.get('code')
    movie = data.get('movie')
    if code in rooms:
        rooms[code]['movie'] = movie
        emit('movie_update', movie, to=code, include_self=False)


@socketio.on('send_message')
def handle_message(data):
    code = data.get('code')
    name = data.get('name', 'Гость')
    text = data.get('text', '').strip()
    if not code or not text or code not in rooms:
        return
    msg = {'name': name, 'text': text}
    rooms[code]['messages'].append(msg)
    emit('message', msg, to=code)


if __name__ == '__main__':
    socketio.run(app, debug=True, host='0.0.0.0', port=5000)