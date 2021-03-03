# Generated by Django 3.0.7 on 2021-03-03 16:33

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('servapp', '0009_review_timestamp'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='service',
            name='rate',
        ),
        migrations.CreateModel(
            name='Booking',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('booking_type', models.CharField(default=False, max_length=300)),
                ('booking_time', models.DateField(auto_now_add=True)),
                ('booking_start', models.DateTimeField()),
                ('booking_end', models.DateTimeField()),
                ('rate', models.CharField(max_length=300)),
                ('client', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='client', to=settings.AUTH_USER_MODEL)),
                ('provider', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='provider', to=settings.AUTH_USER_MODEL)),
                ('service', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='service', to='servapp.Service')),
            ],
        ),
    ]