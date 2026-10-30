# W04-V01: предложение разделения receiver

Исходный w04 и Artist mini03 сохраняются. По переданным Lead независимым VQA/TQA,на seed2states1273/1274 full/back receiver02 закрывает535/535выборочных точек шара почти непрозрачной водой(alpha252–253);front там прозрачен,native/RNG/trigger корректны. Данные exact TQA report b4940d77…b92 и alpha/depth analysis прочитаны; actual successor Artist не запускал.

Подготовка в прежней parts-логике:

1. Неокклюдирующий base/interior: **тот же** full PNG`receiver-v1.png`,SHA4bf235f8981fcb7c3ca3029c2e59a8594e9af28d7de534a56e1ab841a9549843,1547434bytes,ниже шара. Это aliasсуществующего PNG,не новая генерация.
2. Occluding back: новый native`receiver-back-rim-v1`из full master. Только дальний U-образный обод,задняя стенка и дальние половины боковин;вся внутренняя вода и передний корпус удалены в alpha0. Его пригодность подтвердят frame/alpha/registration measurements.
3. Front: прежний`receiver-front-v1.png`,SHAaaaac1a65b694873281326fcfb71fef13b1bdf3f6cea4ac06d3315f93a7bf098,923732bytes,обычный receiver-front depth+1.

Back-rim сохраняет receiver-back depth-1. OpticalO и logicalA должны быть согласованы у всех трёх частей;при неизменном frame проверяем привязку к исходному template,при изменённом canvas заново измеряем O,capture width,registration и вычисляем hR. Никаких offsetsпод1273/1274,нового sinking/fade,изменений радиуса/trigger/геометрии/PRNG.

Исторический proposal. Теперь подготовлен **отдельный mini04 receiver-parts manifest**,см. HANDOFF_MINI_04_RECEIVER_PARTS.md. Builder проверяет,может ли существующий floor/base role размещать full PNG target-bound ниже шара без нового rank/sorting. Если да,передадим отдельный manifestпосле проверки candidate. Если нужны новая schema/слой/существенная подготовка,после сохранённого actual w04 потребуется отдельный явно названный variant;его успех не присваивается исходному способу задним числом.

Dark d01 сначала сохраняется в исходном виде;аналогичное receiver-разделение туда автоматически не переносится. Текущая Dark floor correction меняет только новый bitmap пола и не является receiver-variant.
