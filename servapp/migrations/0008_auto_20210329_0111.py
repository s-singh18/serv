# Generated by Django 3.1.7 on 2021-03-29 01:11

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('servapp', '0007_remove_service_days'),
    ]

    operations = [
        migrations.AlterField(
            model_name='user',
            name='first_name',
            field=models.CharField(blank=True, max_length=150, verbose_name='first name'),
        ),
    ]
