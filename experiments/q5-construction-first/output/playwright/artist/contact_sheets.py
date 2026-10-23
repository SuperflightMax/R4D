"""Review contact sheets only; source art and runtime are never modified."""
from pathlib import Path
from PIL import Image,ImageDraw
root=Path(__file__).resolve().parent
groups={
 'states':['02-idle','03-low','04-walk-a','05-walk-b','06-jump-prepare','07-jump-flight','08-flight-new-low','09-jump-contact','10-landed-low'],
 'routes':['route-one-0.8','route-one-1.6','route-one-2.8','route-one-4.6','route-one-5.8','route-two-1.4','route-two-2.5','route-two-3.3','route-two-4.5','route-two-5.8'],
 'mid':['mid-move-before','mid-move-after','mid-move-follow','mid-jump-before','mid-jump-after','mid-jump-follow'],
 'background':['dark-idle','dark-low','same-low-construction']}
for group,labels in groups.items():
    available=[label for label in labels if (root/f'{label}.png').exists()]
    if not available:continue
    columns=5 if group=='routes' else 3
    w,h=300,360
    sheet=Image.new('RGB',(w*columns,h*((len(available)+columns-1)//columns)),'#f0f1eb')
    draw=ImageDraw.Draw(sheet)
    for i,label in enumerate(available):
        image=Image.open(root/f'{label}.png').convert('RGB')
        # Fixed center crop used only to examine the whole character at a useful review scale.
        x=(image.width-380)//2
        crop=image.crop((x,0,x+380,image.height))
        crop.thumbnail((w,h-24))
        col,row=i%columns,i//columns
        sheet.paste(crop,(col*w+(w-crop.width)//2,row*h+24))
        draw.text((col*w+6,row*h+6),label,fill='#152b31')
    sheet.save(root/f'contact-{group}.png')
    print(group,len(available))
