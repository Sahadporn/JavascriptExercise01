# Javascript practice with rabbitmq

## Steps

- [x] ทำ publisher ( Rabbitmq )
- [x] ส่งข้อมูล Ex. {“_id”: “5630252488”, “name”: “pipusana petgumpoom”, “age”: 27, created_at: ...(lib arrow) (utc datetime), updated_at: ... (utc datetime)}
- [x] ทำ consumer รับข้อมูล ( Rabbitmq )
- [X] ถ้าเป็นข้อมูล นิสิตใหม่ให้ save ลงถังข้อมูลได้เลย  (Mongodb)
- [X] ถ้าเป็นข้อมูลของ นิสิตเก่าให้ทำงาน check การเปลี่ยนแปลงของข้อมูล (Redis )แล้วทำการ Update ข้อมูลที่เปลี่ยนแปลงลงไป  (Mongodb)

Publisher command input

to input commandline arguments
use> i,[id],[name],[age]

```javascript
> node publisher.js i,851204,Loren Beck,23
```

to input csv file
use> c,[filename.csv]

```javascript
> node publisher.js c,test-data.csv
```

## Test

| | |
|---| --- |
| Send data for the first time | Pass |
| Update data | Pass |
| Publish data when there are no comsumer | Pass |
