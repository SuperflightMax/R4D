# J2: существующий мотив поверх неизменного J1

Ноль генераций. Crop master строго `[139,920,278,1090]`; master-crop.png. После просмотра вручную выбран polygon existing patch, без подгонки rig или изменения crop. Точная selection-mask.png имеет только0/255, no feather до масштабирования. Selected-motif.png сохраняет RGB master с этой alpha.

`process/M2/finalize.py` содержит polygon и операцию inverse affine uniform scale0.48, BICUBIC; support67×82. Scaled-motif.png помещён своим top-left в `[68,0]` на transparent221×454. Выход `art/J2/kneepad_overlay.png`; семантический pivot/shin parenting/layer следует контракту, в art они не изменяются.

Это узкий наклонный мотив с пуговицей и исходной строчкой; у края остаётся прежняя ткань. Новых ремней/запаса не добавлялось, масштаб/место не подбирались ради успешной позы. Пригодность покрытия в движении непроверена. Подложки J2 полностью совпадают с J1, проверено SHA.
