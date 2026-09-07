from pathlib import Path
p=Path('src/store.ts'); s=p.read_text(); old='store.replaceData(remote.works, remote.version);'; new='store.replaceData(remote.works, remote.version, remote.shipping);'; assert old in s; p.write_text(s.replace(old,new,1)); print('fixed shipping initial load')
