"""Live lease only; never treats an immutable authority as current permission."""
import json
from pathlib import Path

THREAD = '01a1879b-febf-70f0-b503-71f7a19e356d'
COORDINATOR = Path(r'E:\R4D\perspective\coordination\perspective-two-slots-2026-10-28.json')


def check_lease_fields(shared, auth):
    token = shared.get('token')
    if shared.get('tokenGranted') is not True:
        raise RuntimeError('STOP authoritative lease tokenGranted=false')
    if not isinstance(token,dict) or not auth.get('token') or token.get('id') != auth['token']:
        raise RuntimeError('STOP authoritative lease token mismatch')
    if token.get('status') != 'ACTIVE_SINGLE_USE':
        raise RuntimeError('STOP authoritative lease not ACTIVE_SINGLE_USE')
    if token.get('executorThreadId') != THREAD:
        raise RuntimeError('STOP authoritative lease executor mismatch')
    return {'tokenGranted':True,'tokenMatchesAuth':True,'status':'ACTIVE_SINGLE_USE','executorThreadId':THREAD}


def live_lease(auth):
    return check_lease_fields(json.loads(COORDINATOR.read_bytes())['sharedRelease'],auth)
